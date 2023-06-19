import { useEffect, useState } from 'react'
import { Provider } from '@coral-xyz/anchor'
import { Connection } from '@solana/web3.js'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { Incept } from 'incept-protocol-sdk/sdk/src/clone'
import { getNetworkDetailsFromEnv } from 'incept-protocol-sdk/sdk/src/network'

export const useLoadedIncept = () => {
	const wallet = useAnchorWallet()
	const [incept, setIncept] = useState<Incept | undefined>(undefined)

	useEffect(() => {
		const initializeIncept = async () => {
			const network = getNetworkDetailsFromEnv()
			const new_connection = new Connection(network.endpoint)
			const provider = new Provider(new_connection, wallet!, { preflightCommitment: 'processed' })
			const CloneClient = new Incept(network.clone, provider)
			await CloneClient.loadClone()
			setIncept(CloneClient)
		}
		if (wallet !== undefined) {
			initializeIncept().catch(console.error)
            console.log("INIT INCEPT!")
		}
	}, [wallet])

	return incept
}
