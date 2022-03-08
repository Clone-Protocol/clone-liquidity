import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"

export const fetchAssets = async ({ program, userPubKey, filter }: GetPoolsProps) => {
  if (!userPubKey) return []

  const result: AssetList[] = [
    {
      id: 1,
      tickerName: 'iSolana',
      tickerSymbol: 'iSOL',
      tickerIcon: '/images/assets/ethereum-eth-logo.svg',
      oPrice: 160.51,
      borrowed: 90.11,
      collateral: 111.48,
      collateralRatio: 15898343,
    },
    {
      id: 2,
      tickerName: 'iEthereum',
      tickerSymbol: 'iETH',
      tickerIcon: '/images/assets/ethereum-eth-logo.svg',
      oPrice: 2300.53,
      borrowed: 100.20,
      collateral: 90.11,
      collateralRatio: 111.48,
    }
  ]
  return result
}

interface GetPoolsProps {
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
  oPrice: number
  borrowed: number
  collateral: number
  collateralRatio: number
}