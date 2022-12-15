import { useEffect } from 'react'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { useIncept } from '~/hooks/useIncept'
import useLocalStorage from '~/hooks/useLocalStorage'
import { useGlobalState } from '~/hooks/useGlobalState'
import { ConfirmModalState } from '~/utils/constants'


export default function useInitialized() {
	const { connected, publicKey } = useWallet()
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const [localAccount, setLocalAccount] = useLocalStorage("currentAccount", '')
	const { globalState, setGlobalState } = useGlobalState()

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

				try {
					await program.getUserAccount()
					console.log('getUserAccount')
				} catch (error) {
					console.log("error:", error);
					console.log('err', 'Account does not exist')
					setGlobalState({
						...globalState,
						createAccountModalState: ConfirmModalState.Initial
					})
				}
			}
		}
		getAccount()
	}, [connected, publicKey])

	return true
}
