import { QueryObserverOptions, useQuery } from "react-query"

const fetchPools = async ({ filter }: GetPoolsProps) => {
  const result: PoolList[] = [
    {
      id: 1,
      tickerName: 'iSolana',
      tickerSymbol: 'iSOL',
      tickerIcon: '/images/assets/ethereum-eth-logo.svg',
      price: 160.51,
      liquidityAsset: 90.11,
      liquidityUSD: 111.48,
      liquidityVal: 15898343,
    },
    {
      id: 2,
      tickerName: 'iEthereum',
      tickerSymbol: 'iETH',
      tickerIcon: '/images/assets/ethereum-eth-logo.svg',
      price: 2300.53,
      liquidityAsset: 100.20,
      liquidityUSD: 90.11,
      liquidityVal: 111.48,
    }
  ]
  return result
}

export function useUnconcentPoolsQuery({ filter, refetchOnMount }: GetPoolsProps) {
  return useQuery(
    ['pools', filter],
    () => fetchPools({ filter }),
    {
      refetchOnMount,
    }
  )
}

interface GetPoolsProps {
  filter: FilterType,
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
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
  price: number
  liquidityAsset: number
  liquidityUSD: number
  liquidityVal: number
}