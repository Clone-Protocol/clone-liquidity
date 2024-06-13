import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, arbitrum, arbitrumSepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

export const WagmiConfig = createConfig({
  chains: [arbitrum, arbitrumSepolia], //[mainnet, arbitrum],
  connectors: [
    injected(),
    // metaMask(),
    // walletConnect({ projectId })
  ],
  transports: {
    // [mainnet.id]: http(),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL),
    [arbitrumSepolia.id]: http(),
    // [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL)
  }
});

const queryClient = new QueryClient()
const WagmiWrapper = ({ children }: { children: React.ReactNode }) => {

  return (
    <WagmiProvider config={WagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default WagmiWrapper
