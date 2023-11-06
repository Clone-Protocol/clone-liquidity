import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { useClone } from '~/hooks/useClone'
import useLocalStorage from '~/hooks/useLocalStorage'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, isAlreadyInitializedAccountState } from '~/features/globalAtom'
import { PublicKey } from '@solana/web3.js'
import { CURRENT_ACCOUNT } from '~/data/localstorage'

export default function useInitialized(connected: boolean, publicKey: PublicKey | null, wallet: AnchorWallet | undefined) {
	const { getCloneApp } = useClone()
	const [localAccount, _] = useLocalStorage(CURRENT_ACCOUNT, '')
	const setCreateAccountDialogState = useSetAtom(createAccountDialogState)
	const setIsAlreadyInitializedAccountState = useSetAtom(isAlreadyInitializedAccountState)

	useEffect(() => {
		async function getAccount() {
			console.log('getAccount', connected + "/" + publicKey + "/" + wallet)
			if (connected && publicKey && wallet) {
				console.log('useInitialized')
				// for initialize once per each account
				// if (localAccount === publicKey.toString()) {
				// 	console.log('the account is already initialized')
				// 	setIsAlreadyInitializedAccountState(true);
				// 	return;
				// }

				try {
					console.log('getUserAccount')
					const program = await getCloneApp(wallet)
					await program.getUserAccount()

					setIsAlreadyInitializedAccountState(true);
				} catch (error) {
					console.log("error:", error);
					console.log('err', 'Account does not exist')
					setIsAlreadyInitializedAccountState(false);
					setCreateAccountDialogState(CreateAccountDialogStates.Initial)
				}
			}
		}
		getAccount()
	}, [connected, publicKey, wallet])

	return true
}
