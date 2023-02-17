import { createContext, useContext } from 'react'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"

export interface InceptContextState {
	getInceptApp: () => InceptClient
}

export const InceptContext = createContext<InceptContextState>({} as InceptContextState)

export function useIncept(): InceptContextState {
	return useContext(InceptContext)
}
