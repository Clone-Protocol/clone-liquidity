import React, { FC, ReactNode, useCallback } from 'react'
import { AnchorProvider } from '@project-serum/anchor'
import { Connection } from '@solana/web3.js'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { InceptContext } from '~/hooks/useIncept'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { getNetworkDetailsFromEnv } from 'incept-protocol-sdk/sdk/src/network'
import { Commitment } from '@solana/web3.js'

export interface InceptProviderProps {
	children: ReactNode
}

export const InceptProvider: FC<InceptProviderProps> = ({ children, ...props }) => {
	const _wallet = useWallet();
	const wallet = useAnchorWallet()
	console.log("ow", wallet);
	const getInceptApp = useCallback((): InceptClient | null => {
		const opts = {
			preflightCommitment: "processed" as Commitment,
		}
		const network = getNetworkDetailsFromEnv()
		console.log(network)
		const new_connection = new Connection(network.endpoint)

		const provider = new AnchorProvider(new_connection, wallet!, opts)
		const incept = new InceptClient(network.incept, provider)

		return incept
	}, [wallet])

	return (
		<InceptContext.Provider
			value={{
				// @ts-ignore
				getInceptApp,
			}}>
			{children}
		</InceptContext.Provider>
	)
}
