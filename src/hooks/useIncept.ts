import { Provider } from '@project-serum/anchor'
import { createContext, useContext } from 'react'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'

export interface InceptContextState {
	Program: any
	getInceptApp: () => Incept
}

export const InceptContext = createContext<InceptContextState>({} as InceptContextState)

export function useIncept(): InceptContextState {
	return useContext(InceptContext)
}
