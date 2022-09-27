import { useEffect } from 'react'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import { useIncept } from '~/hooks/useIncept'

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
					return
				}

				try {
					await program.getUserAccount()
					console.log('getUserAccount')
				} catch (error) {
					console.log('err', 'Account does not exist')
					try {
						await program.initializeUser()
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
