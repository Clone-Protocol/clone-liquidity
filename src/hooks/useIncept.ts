import { createContext, useContext } from 'react'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"

export interface InceptContextState {
	getInceptApp: () => Incept
}

export const InceptContext = createContext<InceptContextState>({} as InceptContextState)

export function useIncept(): InceptContextState {
	return useContext(InceptContext)
}
