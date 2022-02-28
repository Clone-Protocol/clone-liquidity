import { QueryObserverOptions, useQuery } from "react-query"

const fetchAssets = async ({ filter }: GetAssetsProps) => {
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

export function useAssetsQuery({ filter, refetchOnMount }: GetAssetsProps) {
  return useQuery(
    ['assets', filter],
    () => fetchAssets({ filter }),
    {
      refetchOnMount,
    }
  )
}

interface GetAssetsProps {
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