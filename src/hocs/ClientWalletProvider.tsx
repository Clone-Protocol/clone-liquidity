import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { WalletDialogProvider } from '~/hocs/WalletDialogProvider'
import { InceptProvider } from '~/hocs/InceptProvider'
import { clusterApiUrl } from '@solana/web3.js'
import { useSnackbar } from 'notistack'
import React, { FC, ReactNode, useCallback, useMemo } from 'react'

const ClientWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;

  // MEMO: it can connect custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
        new PhantomWalletAdapter(),
        new SlopeWalletAdapter(),
        new SolflareWalletAdapter({ network }),
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
        new SolletWalletAdapter({ network }),
        new SolletExtensionWalletAdapter({ network }),
    ],
    [network]
  );

  const { enqueueSnackbar } = useSnackbar();
  const onError = useCallback(
      (error: WalletError) => {
          enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
          console.error(error);
      },
      [enqueueSnackbar]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect>
        <InceptProvider>
          <WalletDialogProvider>
            {children}
          </WalletDialogProvider>
        </InceptProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
export default ClientWalletProvider
