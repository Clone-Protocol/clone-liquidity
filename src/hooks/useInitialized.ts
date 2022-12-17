import { useEffect } from 'react'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { useIncept } from '~/hooks/useIncept'
import { getTokenAccount } from '~/utils/token_accounts'
import useLocalStorage from '~/hooks/useLocalStorage'


export default function useInitialized(setCurrentAccountConfirmDialog: () => void) {
	const { connected, publicKey } = useWallet()
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const [localAccount, setLocalAccount] = useLocalStorage("currentAccount", '')

	useEffect(() => {
		async function getAccount() {			
			if (connected && publicKey && wallet) {
				// for initialize once per each account
				if (localAccount === publicKey.toString()) {
					console.log('the account is already initialized')
					return;
				}

				const program = getInceptApp()
				await program.loadManager()
				if (!program.provider.wallet) {
					return;
				}

				const usdiTokenAccount = await getTokenAccount(program.manager!.usdiMint, publicKey, program.provider.connection);

				try {
					await program.getUserAccount()
					console.log('getUserAccount')
				} catch (error) {
					console.log("error:", error);
					console.log('err', 'Account does not exist')
					setCurrentAccountConfirmDialog(1)
				}
			}
		}
		getAccount()
	}, [connected, publicKey])

	return true
}
