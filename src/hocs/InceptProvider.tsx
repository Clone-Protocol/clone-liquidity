import React, { FC, ReactNode, useState, useCallback } from 'react'
import { Provider } from '@project-serum/anchor'
import { Connection } from '@solana/web3.js'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { InceptContext } from '~/hooks/useIncept'
import { useConnection } from '@solana/wallet-adapter-react'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { DEV_NET } from 'incept-protocol-sdk/sdk/src/network'


export interface InceptProviderProps {
	children: ReactNode
}

export const InceptProvider: FC<InceptProviderProps> = ({ children, ...props }) => {
	const wallet = useAnchorWallet()
	// const { connection } = useConnection()

	const getInceptApp = useCallback((): Incept | null => {
    const opts = {
      preflightCommitment: 'processed',
    }
    const network = DEV_NET
    let new_connection = new Connection(network.endpoint)
    //TODO: to connect wallet's network, use useConnection instead

    // @ts-ignore
    const provider = new Provider(new_connection, wallet, opts.preflightCommitment)
    const incept = new Incept(network.incept, provider)

    console.log('anchor-wallet', provider.wallet)
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
