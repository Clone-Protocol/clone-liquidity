import { QueryObserverOptions, useQuery } from 'react-query'

const fetchAssets = async ({ filter }: GetPoolsProps) => {
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
			borrowed: 100.2,
			collateral: 90.11,
			collateralRatio: 111.48,
		},
	]
	return result
}

export function useBorrowQuery({ filter, refetchOnMount }: GetPoolsProps) {
	return useQuery(['borrowAssets', filter], () => fetchAssets({ filter }), {
		refetchOnMount,
	})
}

interface GetPoolsProps {
	filter: FilterType
	refetchOnMount?: QueryObserverOptions['refetchOnMount']
}

export enum FilterTypeMap {
	'all' = 'All',
	'crypto' = 'Crypto',
	'stocks' = 'Stocks',
	'fx' = 'FX',
	'commodities' = 'Commodities',
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
