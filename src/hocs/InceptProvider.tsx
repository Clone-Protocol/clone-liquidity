import React, { FC, ReactNode, useEffect, useState } from 'react'
import { Provider } from '@project-serum/anchor'
import { Connection } from '@solana/web3.js'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { InceptContext } from '~/hooks/useIncept'
import { useConnection } from '@solana/wallet-adapter-react'
import { Incept, Network } from 'sdk/src/index'
import { getNetworkDetailsFromEnv } from 'sdk/src/network'

export interface InceptProviderProps {
	children: ReactNode
}

export const InceptProvider: FC<InceptProviderProps> = ({ children, ...props }) => {
	const [AnchorProvider, setProvider] = useState<Provider>()
	const [Program, setProgram] = useState<Incept>()
	const wallet = useAnchorWallet()
	const { connection } = useConnection()

	useEffect(() => {
		const opts = {
			preflightCommitment: 'processed',
		}
		const network = getNetworkDetailsFromEnv()
		let new_connection = new Connection(network.endpoint)
		// @ts-ignore
		const provider = new Provider(new_connection, wallet, opts.preflightCommitment)
		setProvider(provider)
	}, [connection])

	const getInceptApp = (): Incept | null => {
		if (AnchorProvider) {
			const network = getNetworkDetailsFromEnv()
			const incept = new Incept(AnchorProvider.connection, network.incept, AnchorProvider)
			setProgram(incept)
			return incept
		}
		return null
	}

	return (
		<InceptContext.Provider
			value={{
				Program,
				// @ts-ignore
				getInceptApp,
			}}>
			{children}
		</InceptContext.Provider>
	)
}
