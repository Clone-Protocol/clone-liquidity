import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { clusterApiUrl } from "@solana/web3.js"

export const CURRENT_NETWORK = process.env.NEXT_PUBLIC_USE_NETWORK

export const DEVNET_PUBLIC = 'https://dev-liquidity.clone.so'
export const MAINNET_PUBLIC = 'https://liquidity.clone.so'

export type RPCType = {
  rpc_name: string
  rpc_url: string
}

export const DEV_RPCs: RPCType[] = [
  {
    rpc_name: 'Helius RPC',
    rpc_url: process.env.NEXT_PUBLIC_NETWORK_ENDPOINT_HELIUS! //clusterApiUrl(WalletAdapterNetwork.Devnet)
  },
  {
    rpc_name: 'Quicknode RPC',
    rpc_url: process.env.NEXT_PUBLIC_NETWORK_ENDPOINT_QUICKNODE!,
  },
  {
    rpc_name: 'HelloMoon RPC',
    rpc_url: process.env.NEXT_PUBLIC_NETWORK_ENDPOINT_HELLOMOON!,
  },
  // {
  //   rpc_name: 'Solana Devnet',
  //   rpc_url: 'https://api.devnet.solana.com',
  // },
]

export const MAIN_RPCs: RPCType[] = [
  {
    rpc_name: 'Helius RPC',
    rpc_url: process.env.NEXT_PUBLIC_NETWORK_ENDPOINT_HELIUS!,  //clusterApiUrl(WalletAdapterNetwork.Mainnet) 
  },
  {
    rpc_name: 'Quicknode RPC',
    rpc_url: process.env.NEXT_PUBLIC_NETWORK_ENDPOINT_QUICKNODE!,
  },
  {
    rpc_name: 'HelloMoon RPC',
    rpc_url: process.env.NEXT_PUBLIC_NETWORK_ENDPOINT_HELLOMOON!,
  },
  // {
  //   rpc_name: 'Solana Mainnet',
  //   rpc_url: 'https://api.devnet.solana.com',
  // },
]

export const CUSTOM_RPC_INDEX = DEV_RPCs.length

export const IS_DEV = CURRENT_NETWORK === "DEV_NET"

export const getTxnURL = (txHash: string) => {
  let cluster = (() => {
    let network = CURRENT_NETWORK;
    if (network === "DEV_NET") {
      return 'devnet-qn1'
    }
    if (network === "MAIN_NET") {
      return 'mainnet-qn1'
    }
    throw new Error(`Network ${network} not yet supported!`)
  })();

  return `https://solana.fm/tx/${txHash}?cluster=${cluster}`
}