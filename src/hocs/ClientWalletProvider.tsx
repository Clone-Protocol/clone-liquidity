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

const ClientWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const network = WalletAdapterNetwork.Devnet

	// MEMO: it can connect custom RPC endpoint
	const endpoint = useMemo(() => clusterApiUrl(network), [network])

	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter({ network }),
			// new SolletWalletAdapter({ network }),
			// new LedgerWalletAdapter(),
			// new SlopeWalletAdapter(),
			// new SolletExtensionWalletAdapter({ network }),
			new TorusWalletAdapter(),
			// new CloverWalletAdapter(),
			// new SolongWalletAdapter(),
			// new MathWalletAdapter(),
			// new GlowWalletAdapter(),
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
