import { useEffect } from 'react'
import { useGlobalState } from '~/hooks/useGlobalState'
import { Links } from '~/data/links'
import { useRouter } from 'next/router'
import { ConfirmModalState } from '~/utils/constants'

export default function useAccountCreationEnforcer() {
	const { globalState, setGlobalState } = useGlobalState()
	const router = useRouter()

	useEffect(() => {
		const handleRouteChange = (path: string) => {
			if (!globalState.declinedAccountCreation) {
				return
			}

			let pathNeedsAccount = false;

			if (router.asPath.startsWith('/assets')) {
				pathNeedsAccount = true
			} else {
				for (let linkItem in Links) {
					if (path === Links[linkItem].path) {
						setGlobalState({
							...globalState,
							createAccountModalState: ConfirmModalState.Reminder
						})
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
