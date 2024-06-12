import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, arbitrum } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

export const WagmiConfig = createConfig({
  chains: [arbitrum], //[mainnet, arbitrum],
  connectors: [
    injected(),
    // metaMask(),
    // walletConnect({ projectId })
  ],
  transports: {
    // [mainnet.id]: http(),
    [arbitrum.id]: http(),
    // [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL)
  }
});

const WagmiWrapper = ({ children }: { children: React.ReactNode }) => {

  return (
    <WagmiProvider config={WagmiConfig}>
      {children}
    </WagmiProvider>
  )
}

export default WagmiWrapper
