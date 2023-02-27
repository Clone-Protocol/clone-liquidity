import React, { FC, ReactNode } from 'react'
import { AnchorProvider } from '@project-serum/anchor'
import { Connection } from '@solana/web3.js'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { InceptContext } from '~/hooks/useIncept'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { useRecoilValue } from 'recoil'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState } from '~/features/globalAtom'
import { getNetworkDetailsFromEnv } from 'incept-protocol-sdk/sdk/src/network'
import { Commitment } from '@solana/web3.js'

export interface InceptProviderProps {
	children: ReactNode
}

export const InceptProvider: FC<InceptProviderProps> = ({ children, ...props }) => {
	const createAccountStatus = useRecoilValue(createAccountDialogState)
	const getInceptApp = (wallet: AnchorWallet | undefined, force?: boolean): InceptClient => {
		if (!force) {
			if (!wallet) {
				throw Error('not detect wallet')
			}
			if (createAccountStatus !== CreateAccountDialogStates.Closed) {
				throw Error('the account is not initialized')
			}
		}

		console.log('wallet', wallet)
		const opts = {
			preflightCommitment: "processed" as Commitment,
		}
		const network = getNetworkDetailsFromEnv()
		console.log('network', network)
		const new_connection = new Connection(network.endpoint)

		const provider = new AnchorProvider(new_connection, wallet!, opts)
		const incept = new InceptClient(network.incept, provider)
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
