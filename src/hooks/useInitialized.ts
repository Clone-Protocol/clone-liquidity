import { useEffect } from 'react'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import { useIncept } from '~/hooks/useIncept'
import { getUSDiAccount, createTokenAccountInstruction } from '~/utils/token_accounts'
import { Transaction } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor"

export default function useInitialized() {
	const { enqueueSnackbar } = useSnackbar()
	const { connected, publicKey } = useWallet()
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()

	useEffect(() => {
		async function getAccount() {
			if (connected && publicKey && wallet) {
				const program = getInceptApp()
				await program.loadManager()
				
				if (!program.provider.wallet) {
					return;
				}

				const usdiTokenAccount = await getUSDiAccount(program);

				try {
					await program.getUserAccount(publicKey)
					console.log('getUserAccount')
				} catch (error) {
					console.log('err', 'Account does not exist')
					let tx = new Transaction();

					if (usdiTokenAccount === undefined) {
						console.log("NO USDI ACCOUNT!")
						tx.add(
							await createTokenAccountInstruction(program.manager!.usdiMint, program)
						)
					}
					tx.add(
						await program.initializeUserInstruction()
					);

					// TODO: Figure out where to move this since it's a temporary solution.
					const singlePoolCometsAccount = anchor.web3.Keypair.generate();
					tx.add(
						await program.program.account.singlePoolComets.createInstruction(
							singlePoolCometsAccount
						)
					);
					tx.add(
						await program.initializeSinglePoolCometsInstruction(
							singlePoolCometsAccount, publicKey
						)
					);

					try {
						await program.provider.send!(tx, [singlePoolCometsAccount]);
					} catch (err) {
						console.log('err: Attempt to debit an account but found no record of a prior credit.')
						enqueueSnackbar('Attempt to debit an account but found no record of a prior credit. Get SOL in Faucet or exchanges')
					}
				}
			}
		}
		getAccount()
	}, [connected, publicKey])

	return true
}
