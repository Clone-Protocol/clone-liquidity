import { useEffect } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { useSnackbar } from 'notistack'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor"
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount } from '~/utils/token_accounts'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import useLocalStorage from '~/hooks/useLocalStorage'
import { CURRENT_ACCOUNT } from '~/data/localstorage';
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState, isCreatingAccountState } from '~/features/globalAtom'
import { useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

/// @TODO: need to refactor.
export function useCreateAccount() {
	const [isCreatingAccount, setIsCreatingAccount] = useRecoilState(isCreatingAccountState)
	const { getInceptApp } = useIncept()
	const { publicKey } = useWallet()
	const wallet = useAnchorWallet()
	const [_, setLocalAccount] = useLocalStorage(CURRENT_ACCOUNT, '')
	const setCreateAccountDialogStatus = useSetRecoilState(createAccountDialogState)
	const setDeclinedAccountCreation = useSetRecoilState(declinedAccountCreationState)
	const { enqueueSnackbar } = useSnackbar()
	const { setTxState } = useTransactionState()

	useEffect(() => {
		async function createAccount() {
			if (wallet) {
				const program = getInceptApp(wallet, true)
				await program.loadManager()

				const pubKey = publicKey as anchor.web3.PublicKey

				let tx = new Transaction();
				const usdiTokenAccount = await getTokenAccount(program.incept!.usdiMint, pubKey, program.provider.connection);

				if (usdiTokenAccount === undefined) {
					console.log("NO USDI ACCOUNT!")
					const associatedToken = await getAssociatedTokenAddress(
						program.incept!.usdiMint,
						publicKey as anchor.web3.PublicKey
					);

					tx.add(
						createAssociatedTokenAccountInstruction(
							pubKey,
							associatedToken,
							pubKey,
							program.incept!.usdiMint
						)
					);
				}

				tx.add(
					await program.initializeUserInstruction(pubKey)
				);

				// TODO: Figure out where to move this since it's a temporary solution.
				const singlePoolCometsAccount = anchor.web3.Keypair.generate();
				tx.add(
					await program.initializeCometInstruction(
						singlePoolCometsAccount,
						true,
						pubKey
					)
				);

				const multiPoolCometsAccount = anchor.web3.Keypair.generate();
				tx.add(
					await program.initializeCometInstruction(
						multiPoolCometsAccount,
						false,
						pubKey
					)
				);

				try {
					// await program.provider.sendAndConfirm!(tx, [singlePoolCometsAccount, multiPoolCometsAccount]);
					await sendAndConfirm(program, tx, setTxState, [singlePoolCometsAccount, multiPoolCometsAccount])

					// store account to localstorage
					console.log('store account')
					setLocalAccount(pubKey.toString())
					setCreateAccountDialogStatus(CreateAccountDialogStates.Closed)
					//hacky sync
					location.reload()
				} catch (err) {
					console.log(err)
					console.log('err: Attempt to debit an account but found no record of a prior credit.')
					setDeclinedAccountCreation(true)
					enqueueSnackbar('Attempt to debit an account but found no record of a prior credit. Get SOL in Faucet or exchanges')
				} finally {
					setIsCreatingAccount(false)
				}
			}
		}

		if (isCreatingAccount) {
			createAccount()
		}

	}, [wallet, isCreatingAccount])
}
