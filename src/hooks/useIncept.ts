import { createContext, useContext } from 'react'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { AnchorWallet } from '@solana/wallet-adapter-react'

export interface InceptContextState {
	getInceptApp: (wallet: AnchorWallet | undefined, force?: boolean) => InceptClient
}

export const InceptContext = createContext<InceptContextState>({} as InceptContextState)

export function useIncept(): InceptContextState {
	return useContext(InceptContext)
}
