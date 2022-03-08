import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"


export const fetchAssets = async ({ program, userPubKey, filter }: GetAssetsProps) => {
  if (!userPubKey) return []

  const result: AssetList[] = [
    {
      id: 1,
      tickerName: 'iSolana',
      tickerSymbol: 'iSOL',
      tickerIcon: '/images/assets/ethereum-eth-logo.svg',
      price: 160.51,
      liquidity: 2551,
      volume24h: 15898343,
      baselineAPY: 28.9
    },
    {
      id: 2,
      tickerName: 'iEthereum',
      tickerSymbol: 'iETH',
      tickerIcon: '/images/assets/ethereum-eth-logo.svg',
      price: 2300.53,
      liquidity: 2551,
      volume24h: 15898343,
      baselineAPY: 28.9
    }
  ]
  return result
}

interface GetAssetsProps {
  program: Incept,
  userPubKey: PublicKey | null,
  filter: FilterType,
}

export enum FilterTypeMap {
	'all' = 'All',
	'crypto' = 'Crypto',
	'stocks' = 'Stocks',
	'fx' = 'FX',
  'commodities' = 'Commodities'
}
export type FilterType = keyof typeof FilterTypeMap

// export interface AssetsData {
//   list: AssetList[];
//   total: number;
// }

export interface AssetList {
  id: number
  tickerName: string
  tickerSymbol: string
  tickerIcon: string
  price: number
  liquidity: number
  volume24h: number
  baselineAPY: number
}