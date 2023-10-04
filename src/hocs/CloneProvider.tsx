import React, { FC, ReactNode } from 'react'
import { AnchorProvider } from '@coral-xyz/anchor'
import { Connection, PublicKey, Commitment } from '@solana/web3.js'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { CloneContext } from '~/hooks/useClone'
import { useAtom, useAtomValue } from 'jotai'
import { Clone as CloneAccount } from 'clone-protocol-sdk/sdk/generated/clone'
import { cloneClient, connectedPubKey } from '~/features/globalAtom'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState } from '~/features/globalAtom'
import { getNetworkDetailsFromEnv } from 'clone-protocol-sdk/sdk/src/network'
import { CloneClient } from 'clone-protocol-sdk/sdk/src/clone'

export interface CloneProviderProps {
	children: ReactNode
}

export const CloneProvider: FC<CloneProviderProps> = ({ children }) => {
	const createAccountStatus = useAtomValue(createAccountDialogState)
	const [mainCloneClient, setMainCloneClient] = useAtom(cloneClient)
	const [mainConnectedPubKey, setMainConnectedPubKey] = useAtom(connectedPubKey)

	const getCloneApp = async (wallet: AnchorWallet | undefined, force?: boolean): Promise<CloneClient> => {
		let isChangePubKey = false
		if (!force) {
			if (!wallet) {
				throw Error('not detect wallet')
			}
			if (createAccountStatus !== CreateAccountDialogStates.Closed) {
				throw Error('the account is not initialized')
			}
			if (wallet.publicKey.toString() !== mainConnectedPubKey) {
				isChangePubKey = true
				setMainConnectedPubKey(wallet.publicKey.toString())
			}
		}

		// console.log('wallet', wallet)
		let clone
		// if (!mainCloneClient || isChangePubKey) {
		const opts = {
			preflightCommitment: "processed" as Commitment,
		}
		const network = getNetworkDetailsFromEnv()
		// console.log('network', network)
		const new_connection = new Connection(network.endpoint)
		const provider = new AnchorProvider(new_connection, wallet!, opts)

		const [cloneAccountAddress, _] = PublicKey.findProgramAddressSync(
			[Buffer.from("clone")],
			network.clone
		);
		const cAccount = await CloneAccount.fromAccountAddress(
			provider.connection,
			cloneAccountAddress
		);
		clone = new CloneClient(provider, cAccount, network.clone)
		// 	setMainCloneClient(clone)
		// } else {
		// 	clone = mainCloneClient
		// }

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
