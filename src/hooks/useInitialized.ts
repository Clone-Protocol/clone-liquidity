import { useEffect } from 'react'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import { useIncept } from '~/hooks/useIncept'
import { fetchUSDiAccount, createTokenAccountInstruction } from '~/utils/token_accounts'
import { Transaction } from "@solana/web3.js";

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

				// if (!program.provider.wallet) {
				// 	return
				// }
				if (!program.provider.publicKey) {
					return;
				}

				const usdiTokenAccount = await fetchUSDiAccount(program);

				try {
					await program.getUserAccount()
					console.log('getUserAccount')
				} catch (error) {
					console.log('err', 'Account does not exist')
					try {
						if (usdiTokenAccount === undefined) {
							console.log("NO USDI ACCOUNT!")
							const transactions = new Transaction().add(
								await createTokenAccountInstruction(program.manager!.usdiMint, program)
							).add(
								await program.initializeUserInstruction()
							);
							await program.provider.sendAndConfirm!(transactions);

						} else {
							await program.initializeUser()
						}
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
