import React, { FC, useState } from 'react'
import { GlobalStateContext, GlobalStateProps } from '~/hooks/useGlobalState'
import { ConfirmModalState } from '~/utils/constants'

export const GlobalStateProvider: FC = ({ children, ...props }) => {
	const defaultState: GlobalStateProps = {
		createAccountModalState: ConfirmModalState.Closed,
		declinedAccountCreation: false
	}
	const [globalState, setGlobalState] = useState(defaultState)

	return (
		<GlobalStateContext.Provider
			value={{
				globalState,
				setGlobalState
			}}>
		{children}
		</GlobalStateContext.Provider>
	)
}