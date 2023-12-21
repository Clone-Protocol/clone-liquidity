import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import {
	PhantomWalletAdapter,
	SolflareWalletAdapter,
	TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { WalletDialogProvider } from '~/hocs/WalletDialogProvider'
import { CloneProvider } from '~/hocs/CloneProvider'
import { clusterApiUrl } from '@solana/web3.js'
import React, { FC, ReactNode, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { rpcEndpoint } from '~/features/globalAtom'

const ClientWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
	//@TODO: need to set network based on network
	const network = WalletAdapterNetwork.Devnet
	const rpcUrl = useAtomValue(rpcEndpoint)

	// MEMO: it can connect custom RPC endpoint
	const endpoint = useMemo(() => {
		const endpointUrl = clusterApiUrl(network)
		console.log('endpointUrl', endpointUrl)
		return endpointUrl
	}, [network])

	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter({ network }),
			new TorusWalletAdapter(),
		],
		[network]
	)

	// const { enqueueSnackbar } = useSnackbar()
	const onError = (error: WalletError) => {
		// enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' })
		console.log('walletError', error)
	}

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} onError={onError} autoConnect>
				<CloneProvider>
					<WalletDialogProvider>{children}</WalletDialogProvider>
				</CloneProvider>
			</WalletProvider>
		</ConnectionProvider>
	)
}
export default ClientWalletProvider
