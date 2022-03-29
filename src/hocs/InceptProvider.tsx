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
	// const [AnchorProvider, setProvider] = useState<Provider>()
	const [InceptSDK, setInceptSDK] = useState<Incept>()
	const wallet = useAnchorWallet()
	// const { connection } = useConnection()

	// useEffect(() => {
  //   if (wallet) {
  //     const opts = {
  //       preflightCommitment: 'processed',
  //     }
  //     const network = getNetworkDetailsFromEnv()
  //     let new_connection = new Connection(network.endpoint)
  //     // @ts-ignore
  //     const provider = new Provider(new_connection, wallet, opts.preflightCommitment)
  //     setProvider(provider)
  //   }
	// }, [connection, wallet])

	const getInceptApp = (): Incept | null => {
		// if (AnchorProvider) {
    const opts = {
      preflightCommitment: 'processed',
    }
    const network = getNetworkDetailsFromEnv()
    let new_connection = new Connection(network.endpoint)
    // @ts-ignore
    const provider = new Provider(new_connection, wallet, opts.preflightCommitment)
    const incept = new Incept(provider.connection, network.incept, provider)
    setInceptSDK(incept)

    console.log('anchor-wallet', provider.wallet)
    return incept
	}

	return (
		<InceptContext.Provider
			value={{
				InceptSDK,
				// @ts-ignore
				getInceptApp,
			}}>
			{children}
		</InceptContext.Provider>
	)
}
