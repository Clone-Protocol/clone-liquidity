import { createContext, useContext } from 'react'
import { CloneClient } from "incept-protocol-sdk/sdk/src/clone"
import { AnchorWallet } from '@solana/wallet-adapter-react'

export interface InceptContextState {
	getCloneApp: (wallet: AnchorWallet | undefined, force?: boolean) => CloneClient
}

export const InceptContext = createContext<InceptContextState>({} as InceptContextState)

export function useIncept(): InceptContextState {
	return useContext(InceptContext)
}
