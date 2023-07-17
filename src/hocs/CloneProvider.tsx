import React, { FC, ReactNode } from 'react'
import { AnchorProvider } from '@coral-xyz/anchor'
import { Connection } from '@solana/web3.js'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { CloneContext } from '~/hooks/useClone'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { useAtomValue } from 'jotai'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState } from '~/features/globalAtom'
import { getNetworkDetailsFromEnv } from 'clone-protocol-sdk/sdk/src/network'
import { Commitment } from '@solana/web3.js'

export interface CloneProviderProps {
	children: ReactNode
}

export const CloneProvider: FC<CloneProviderProps> = ({ children, ...props }) => {
	const createAccountStatus = useAtomValue(createAccountDialogState)
	const getCloneApp = (wallet: AnchorWallet | undefined, force?: boolean): CloneClient => {
		if (!force) {
			if (!wallet) {
				throw Error('not detect wallet')
			}
			if (createAccountStatus !== CreateAccountDialogStates.Closed) {
				throw Error('the account is not initialized')
			}
		}

		// console.log('wallet', wallet)
		const opts = {
			preflightCommitment: "processed" as Commitment,
		}
		const network = getNetworkDetailsFromEnv()
		// console.log('network', network)
		const new_connection = new Connection(network.endpoint)

		const provider = new AnchorProvider(new_connection, wallet!, opts)
		const clone = new CloneClient(network.clone, provider)
		return clone
	}

	return (
		<CloneContext.Provider
			value={{
				getCloneApp,
			}}>
			{children}
		</CloneContext.Provider>
	)
}
