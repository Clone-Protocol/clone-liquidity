import { useEffect } from 'react'
import { useSetRecoilState, useRecoilValue } from 'recoil'
import { Links } from '~/data/links'
import { useRouter } from 'next/router'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState } from '~/features/globalAtom'

export default function useAccountCreationEnforcer() {
	const setCreateAccountDialogState = useSetRecoilState(createAccountDialogState)
	const declinedAccountCreation = useRecoilValue(declinedAccountCreationState)
	const router = useRouter()

	useEffect(() => {
		const handleRouteChange = (path: string) => {
			if (!declinedAccountCreation) {
				return
			}

			let pathNeedsAccount = false;

			if (router.asPath.startsWith('/assets')) {
				pathNeedsAccount = true
			} else {
				for (let linkItem in Links) {
					if (path === Links[linkItem].path) {
						setCreateAccountDialogState(CreateAccountDialogStates.Reminder)
						pathNeedsAccount = true
					}
				}
			}

			if (pathNeedsAccount) {
				throw 'Account needed. Abort route change' // this is the way to prevent route change
			}
		}

		router.events.on('routeChangeStart', handleRouteChange)

		return () => {
			
		}
	}, [globalState])
}
