import { useEffect } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { useSnackbar } from 'notistack'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { TransactionInstruction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor"
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount } from '~/utils/token_accounts'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import useLocalStorage from '~/hooks/useLocalStorage'
import { CURRENT_ACCOUNT } from '~/data/localstorage';
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState, isCreatingAccountState } from '~/features/globalAtom'
import { useTransactionState } from "~/hooks/useTransactionState"
import { sendAndConfirm } from '~/utils/tx_helper';

/// @TODO: need to refactor.
export function useCreateAccount() {
	const [isCreatingAccount, setIsCreatingAccount] = useRecoilState(isCreatingAccountState)
	const { getCloneApp } = useIncept()
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
				const program = getCloneApp(wallet, true)
				await program.loadClone()

				let ixnCalls: Promise<TransactionInstruction>[] = []

				const usdiTokenAccount = await getTokenAccount(program.incept!.usdiMint, publicKey!, program.provider.connection);
				const {userPubkey} = await program.getUserAddress()
				const associatedToken = await getAssociatedTokenAddress(
					program.incept!.usdiMint,
					publicKey!
				);

				if (usdiTokenAccount === undefined) {
					ixnCalls.push(
						(async () => createAssociatedTokenAccountInstruction(
							publicKey!,
							associatedToken,
							publicKey!,
							program.incept!.usdiMint
						))()
					)
				}

				ixnCalls.push(program.initializeUserInstruction(publicKey!))

				// TODO: Figure out where to move this since it's a temporary solution.
				const singlePoolCometsAccount = anchor.web3.Keypair.generate();
				ixnCalls.push(program.program.account.comet.createInstruction(singlePoolCometsAccount))
				ixnCalls.push(program.program.methods
					.initializeComet(true)
					.accounts({
					  user: publicKey!,
					  userAccount: userPubkey,
					  comet: singlePoolCometsAccount.publicKey,
					  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
					  tokenProgram: TOKEN_PROGRAM_ID,
					  systemProgram: anchor.web3.SystemProgram.programId,
					})
					.instruction()
				)

				const multiPoolCometsAccount = anchor.web3.Keypair.generate();
				ixnCalls.push(program.program.account.comet.createInstruction(multiPoolCometsAccount))
				ixnCalls.push(program.program.methods
					.initializeComet(false)
					.accounts({
					  user: publicKey!,
					  userAccount: userPubkey,
					  comet: multiPoolCometsAccount.publicKey,
					  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
					  tokenProgram: TOKEN_PROGRAM_ID,
					  systemProgram: anchor.web3.SystemProgram.programId,
					})
					.instruction()
				)

				try {
					let ixns = await Promise.all(ixnCalls)
					await sendAndConfirm(program.provider, ixns, setTxState, [singlePoolCometsAccount, multiPoolCometsAccount])

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
