import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor"
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount } from '~/utils/token_accounts'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import useLocalStorage from '~/hooks/useLocalStorage'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState, isCreatingAccountState } from '~/features/globalAtom'

export function useCreateAccount() {
	const [isCreatingAccount, setIsCreatingAccount] = useRecoilState(isCreatingAccountState)
	const { getInceptApp } = useIncept()
	const { publicKey } = useWallet()
	const [_, setLocalAccount] = useLocalStorage("currentAccount", '')
	const [createAccountDialogStatus, setCreateAccountDialogStatus] = useRecoilState(createAccountDialogState)
	const [declinedAccountCreation, setDeclinedAccountCreation] = useRecoilState(declinedAccountCreationState)
	const { enqueueSnackbar } = useSnackbar()

	useEffect(() => {
		async function createAccount() {
			const program = getInceptApp()
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
				await program.provider.send!(tx, [singlePoolCometsAccount, multiPoolCometsAccount]);

				// store account to localstorage
				console.log('store account')
				setLocalAccount(pubKey.toString())
				setCreateAccountDialogStatus(CreateAccountDialogStates.Closed)
			} catch (err) {
				console.log(err)
				console.log('err: Attempt to debit an account but found no record of a prior credit.')
				setDeclinedAccountCreation(true)
				enqueueSnackbar('Attempt to debit an account but found no record of a prior credit. Get SOL in Faucet or exchanges')
			} finally {
				setIsCreatingAccount(false)
			}
		}
		
		if (isCreatingAccount) {
			createAccount()
		}
		
	}, [isCreatingAccount])
}
