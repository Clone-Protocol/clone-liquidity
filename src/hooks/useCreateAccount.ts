import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import { Transaction } from "@solana/web3.js";
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount, createTokenAccountInstruction } from '~/utils/token_accounts'
import * as anchor from "@project-serum/anchor"
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import useLocalStorage from '~/hooks/useLocalStorage'

export default function useCreateAccount(startAccountCreation: boolean, setShouldCreateAccount : () => void) {
	const { enqueueSnackbar } = useSnackbar()
	const { getInceptApp } = useIncept()
	const { connected, publicKey } = useWallet()
	
	const [localAccount, setLocalAccount] = useLocalStorage("currentAccount", '')
	

	useEffect(() => {
		async function createAccount() {
			const program = getInceptApp()
			await program.loadManager()
			
			const usdiTokenAccount = await getTokenAccount(program.manager!.usdiMint, publicKey, program.provider.connection);

			let tx = new Transaction();

			if (usdiTokenAccount === undefined) {
				console.log("NO USDI ACCOUNT!")
				const associatedToken = await getAssociatedTokenAddress(
					program.manager!.usdiMint,
					publicKey
				);

				tx.add(
					createAssociatedTokenAccountInstruction(
						publicKey,
						associatedToken,
						publicKey,
						program.manager!.usdiMint
					)
				);
			}
	
			tx.add(
				await program.initializeUserInstruction(publicKey)
			);

			// TODO: Figure out where to move this since it's a temporary solution.
			const singlePoolCometsAccount = anchor.web3.Keypair.generate();
			tx.add(
				await program.initializeCometInstruction(
					singlePoolCometsAccount,
					true,
					publicKey
				)
			);

			const multiPoolCometsAccount = anchor.web3.Keypair.generate();
			tx.add(
				await program.initializeCometInstruction(
					multiPoolCometsAccount,
					false,
					publicKey
				)
			);

			try {
				await program.provider.send!(tx, [singlePoolCometsAccount, multiPoolCometsAccount]);

				// store account to localstorage
				console.log('store account')
				setLocalAccount(publicKey.toString())
				setShouldCreateAccount(false)
			} catch (err) {
				console.log(err)
				console.log('err: Attempt to debit an account but found no record of a prior credit.')
				enqueueSnackbar('Attempt to debit an account but found no record of a prior credit. Get SOL in Faucet or exchanges')
			}
		}
		if (startAccountCreation) {
			createAccount()
		}
	}, [startAccountCreation])
}