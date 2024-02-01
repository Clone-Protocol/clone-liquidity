import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { useClone } from '~/hooks/useClone'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, isAlreadyInitializedAccountState } from '~/features/globalAtom'
import { PublicKey } from '@solana/web3.js'

export default function useInitialized(connected: boolean, publicKey: PublicKey | null, wallet: AnchorWallet | undefined, isWhitelisted: boolean) {
	const { getCloneApp } = useClone()
	const setCreateAccountDialogState = useSetAtom(createAccountDialogState)
	const setIsAlreadyInitializedAccountState = useSetAtom(isAlreadyInitializedAccountState)

	useEffect(() => {
		async function getAccount() {
			console.log('getAccount', connected + "/" + publicKey + "/" + wallet + "/" + isWhitelisted)
			if (connected && publicKey && wallet && isWhitelisted) {
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
	}, [connected, publicKey, wallet, isWhitelisted])

	return true
}
