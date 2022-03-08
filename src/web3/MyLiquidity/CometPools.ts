import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"

export const fetchPools = async ({ program, userPubKey, filter }: GetPoolsProps) => {
  if (!userPubKey) return []

  const result: PoolList[] = [
    {
      id: 1,
      tickerName: 'iSolana',
      tickerSymbol: 'iSOL',
      tickerIcon: '/images/assets/ethereum-eth-logo.svg',
      iPrice: 160.51,
      cPrice: 100.20,
      fromPriceRange: 90.11,
      toPriceRange: 111.48,
      collateral: 15898343,
      ild: 28.9
    },
    {
      id: 2,
      tickerName: 'iEthereum',
      tickerSymbol: 'iETH',
      tickerIcon: '/images/assets/ethereum-eth-logo.svg',
      iPrice: 2300.53,
      cPrice: 100.20,
      fromPriceRange: 90.11,
      toPriceRange: 111.48,
      collateral: 15898343,
      ild: 28.9
    }
  ]
  return result
}

interface GetPoolsProps {
  program: Incept,
  userPubKey: PublicKey | null,
  filter: FilterType
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

export interface PoolList {
  id: number
  tickerName: string
  tickerSymbol: string
  tickerIcon: string
  iPrice: number
  cPrice: number
  fromPriceRange: number
  toPriceRange: number
  collateral: number
  ild: number
}