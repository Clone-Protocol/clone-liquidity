import { useEffect, useState } from 'react'
import { Provider } from '@project-serum/anchor'
import { Connection } from '@solana/web3.js'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { Incept } from 'incept-protocol-sdk/sdk/src/incept'
import { getNetworkDetailsFromEnv } from 'incept-protocol-sdk/sdk/src/network'

export const useLoadedIncept = () => {
	const wallet = useAnchorWallet()
	const [incept, setIncept] = useState<Incept | undefined>(undefined)

	useEffect(() => {
		const initializeIncept = async () => {
			const network = getNetworkDetailsFromEnv()
			const new_connection = new Connection(network.endpoint)
			const provider = new Provider(new_connection, wallet!, { preflightCommitment: 'processed' })
			const inceptClient = new Incept(network.incept, provider)
			await inceptClient.loadManager()
			setIncept(inceptClient)
		}
		if (wallet !== undefined) {
			initializeIncept().catch(console.error)
            console.log("INIT INCEPT!")
		}
	}, [wallet])

	return incept
}
