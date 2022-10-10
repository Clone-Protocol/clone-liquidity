import { QueryObserverOptions, useQuery } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { assetMapping, AssetType } from '~/data/assets'
import { FilterType } from '~/data/filter'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'

export const fetchAssets = async ({ program, setStartTimer }: { program: Incept, setStartTimer: (start: boolean) => void}) => {
	console.log('fetchAssets')
	// start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);
    
	await program.loadManager()

	const iassetInfos = await program.getiAssetInfos()

	const result: AssetList[] = []

	for (const info of iassetInfos) {
		let { tickerName, tickerSymbol, tickerIcon, assetType } = assetMapping(info[0])
		result.push({
			id: info[0],
			tickerName: tickerName,
			tickerSymbol: tickerSymbol,
			tickerIcon: tickerIcon,
			price: info[1],
			assetType: assetType,
			liquidity: parseInt(info[2].toString()),
			volume24h: 0, //coming soon
			baselineAPY: 0, //coming soon
		})
	}

  // const result: AssetList[] = [
	//   {
	//     id: 1,
	//     tickerName: 'iSolana',
	//     tickerSymbol: 'iSOL',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	//     price: 160.51,
	//     liquidity: 2551,
	//     volume24h: 15898343,
	//     baselineAPY: 28.9
	//   },
	// ]
	return result
}

interface GetAssetsProps {
	filter: FilterType
  searchTerm: string
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
  enabled?: boolean
}

export interface AssetList {
	id: number
	tickerName: string
	tickerSymbol: string
	tickerIcon: string
	price: number
	assetType: number
	liquidity: number
	volume24h: number
	baselineAPY: number
}

export function useAssetsQuery({ filter, searchTerm, refetchOnMount, enabled = true }: GetAssetsProps) {
  const { getInceptApp } = useIncept()
	const { setStartTimer } = useDataLoading()

  return useQuery(['assets'], () => fetchAssets({ program: getInceptApp(), setStartTimer }), {
    refetchOnMount,
		refetchInterval: REFETCH_CYCLE,
		refetchIntervalInBackground: true,
    enabled,
    select: (assets) => {
			if (searchTerm && searchTerm.length > 0) {
				return assets.filter((asset) => asset.tickerName.toLowerCase().includes(searchTerm.toLowerCase()) || asset.tickerSymbol.toLowerCase().includes(searchTerm.toLowerCase()))
			} else {
				return assets.filter((asset) => {
					if (filter === 'crypto') {
						return asset.assetType === AssetType.Crypto
					} else if (filter === 'fx') {
						return asset.assetType === AssetType.Fx
					} else if (filter === 'commodities') {
						return asset.assetType === AssetType.Commodities
					} else if (filter === 'stocks') {
						return asset.assetType === AssetType.Stocks
					}
					return true;
				})
			}
		}
  })
}
