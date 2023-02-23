import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { useIncept } from '~/hooks/useIncept'
import useLocalStorage from '~/hooks/useLocalStorage'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState } from '~/features/globalAtom'

export default function useInitialized() {
	const { connected, publicKey } = useWallet()
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const [localAccount, setLocalAccount] = useLocalStorage("currentAccount", '')
	const setCreateAccountDialogState = useSetRecoilState(createAccountDialogState)

	useEffect(() => {
		async function getAccount() {
			if (connected && publicKey && wallet) {
				console.log('useInitialized')
				// for initialize once per each account
				if (localAccount === publicKey.toString()) {
					console.log('the account is already initialized')
					return;
				}

				try {
					console.log('getUserAccount')
					const program = getInceptApp(wallet)
					await program.loadManager()
					await program.getUserAccount()
				} catch (error) {
					console.log("error:", error);
					console.log('err', 'Account does not exist')
					setCreateAccountDialogState(CreateAccountDialogStates.Initial)
				}
			}
		}
		getAccount()
	}, [connected, publicKey])

	return true
}
