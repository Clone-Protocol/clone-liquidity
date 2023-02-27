import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { useIncept } from '~/hooks/useIncept'
import useLocalStorage from '~/hooks/useLocalStorage'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState } from '~/features/globalAtom'
import { PublicKey } from '@solana/web3.js'

/// @TODO: need to rewrite whole logic
export default function useInitialized(connected: boolean, publicKey: PublicKey | null, wallet: AnchorWallet | undefined) {
	const { getInceptApp } = useIncept()
	const [localAccount, _] = useLocalStorage("currentAccount", '')
	const setCreateAccountDialogState = useSetRecoilState(createAccountDialogState)

	useEffect(() => {
		async function getAccount() {
			console.log('getAccount', connected + "/" + publicKey + "/" + wallet)
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
	}, [connected, publicKey, wallet])

	return true
}
