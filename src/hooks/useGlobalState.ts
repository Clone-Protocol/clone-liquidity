import { createContext, useContext } from 'react'
import { ConfirmModalState } from '~/utils/constants'

export interface GlobalStateProps {
	createAccountModalState: ConfirmModalState
	declinedAccountCreation: boolean 
}

export interface GlobalStateContextState {
	globalState: GlobalStateProps
	setGlobalState: (m: object) => void
}

export const GlobalStateContext = createContext<GlobalStateContextState>({} as GlobalStateContextState)

export function useGlobalState(): GlobalStateContextState {
	return useContext(GlobalStateContext)
}