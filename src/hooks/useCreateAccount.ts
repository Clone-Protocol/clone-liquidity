import { useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useSnackbar } from 'notistack'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { TransactionInstruction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor"
import { useClone } from '~/hooks/useClone'
import { getTokenAccount } from '~/utils/token_accounts'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import useLocalStorage from '~/hooks/useLocalStorage'
import { CURRENT_ACCOUNT } from '~/data/localstorage';
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState, isCreatingAccountState } from '~/features/globalAtom'
import { useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

export function useCreateAccount() {
	const [isCreatingAccount, setIsCreatingAccount] = useAtom(isCreatingAccountState)
	const { getCloneApp } = useClone()
	const { publicKey } = useWallet()
	const wallet = useAnchorWallet()
	const [_, setLocalAccount] = useLocalStorage(CURRENT_ACCOUNT, '')
	const setCreateAccountDialogStatus = useSetAtom(createAccountDialogState)
	const setDeclinedAccountCreation = useSetAtom(declinedAccountCreationState)
	const { enqueueSnackbar } = useSnackbar()
	const { setTxState } = useTransactionState()

	useEffect(() => {
		async function createAccount() {
			if (wallet) {
				const program = getCloneApp(wallet, true)

				let ixnCalls: Promise<TransactionInstruction>[] = []

				const usdiTokenAccount = await getTokenAccount(program.clone!.onusdMint, publicKey!, program.provider.connection);
				const { userPubkey } = await program.getUserAddress()
				const associatedToken = await getAssociatedTokenAddress(
					program.clone!.onusdMint,
					publicKey!
				);

				if (usdiTokenAccount === undefined) {
					ixnCalls.push(
						(async () => createAssociatedTokenAccountInstruction(
							publicKey!,
							associatedToken,
							publicKey!,
							program.clone!.onusdMint
						))()
					)
				}

				ixnCalls.push(program.initializeUserInstruction(publicKey!))


				const cometsAccount = anchor.web3.Keypair.generate();
				ixnCalls.push(program.program.account.comet.createInstruction(cometsAccount))
				ixnCalls.push(program.program.methods
					.initializeComet()
					.accounts({
						user: publicKey!,
						userAccount: userPubkey,
						comet: cometsAccount.publicKey,
						rent: anchor.web3.SYSVAR_RENT_PUBKEY,
						tokenProgram: TOKEN_PROGRAM_ID,
						systemProgram: anchor.web3.SystemProgram.programId,
					})
					.instruction()
				)

				try {
					let ixns = await Promise.all(ixnCalls)
					await sendAndConfirm(program.provider, ixns, setTxState, [cometsAccount])

					// store account to localstorage
					console.log('store account')
					setLocalAccount(publicKey!.toString())
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
