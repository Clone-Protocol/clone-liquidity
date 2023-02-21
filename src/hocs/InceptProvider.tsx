import React, { FC, ReactNode, useCallback } from 'react'
import { AnchorProvider, Provider } from '@project-serum/anchor'
import { Connection } from '@solana/web3.js'
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { InceptContext } from '~/hooks/useIncept'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { getNetworkDetailsFromEnv } from 'incept-protocol-sdk/sdk/src/network'
import { Commitment } from '@solana/web3.js'

export interface InceptProviderProps {
	children: ReactNode
}

export const InceptProvider: FC<InceptProviderProps> = ({ children, ...props }) => {
	// const wallet = useAnchorWallet()
	// console.log("ow", wallet);

	const getInceptApp = (wallet: AnchorWallet): InceptClient => {
		console.log('wallet', wallet)
		const opts = {
			preflightCommitment: "processed" as Commitment,
		}
		const network = getNetworkDetailsFromEnv()
		console.log(network)
		const new_connection = new Connection(network.endpoint)

		const provider = new AnchorProvider(new_connection, wallet, opts)
		const incept = new InceptClient(network.incept, provider)

		console.log('anchor-wallet', provider.wallet)
		return incept
	}

	return (
		<InceptContext.Provider
			value={{
				getInceptApp,
			}}>
			{children}
		</InceptContext.Provider>
	)
}
