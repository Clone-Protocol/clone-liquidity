import { Query, useQuery } from 'react-query'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { assetMapping, AssetType } from '~/data/assets'
import { FilterType } from '~/data/filter'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getiAssetInfos } from '~/utils/assets';
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchAssets = async ({ program, setStartTimer }: { program: InceptClient, setStartTimer: (start: boolean) => void }) => {
	console.log('fetchAssets')
	// start timer in data-loading-indicator
	setStartTimer(false);
	setStartTimer(true);

	await program.loadManager()
	const tokenData = await program.getTokenData();
	const iassetInfos = getiAssetInfos(tokenData);

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
	return result
}

interface GetAssetsProps {
	filter: FilterType
	searchTerm: string
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
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
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setStartTimer } = useDataLoading()

	let queryFunc
	try {
		const program = getInceptApp(wallet)
		queryFunc = () => fetchAssets({ program, setStartTimer })
	} catch (e) {
		console.error(e)
		queryFunc = () => []
	}

	return useQuery(['assets'], queryFunc, {
		refetchOnMount,
		refetchInterval: REFETCH_CYCLE,
		refetchIntervalInBackground: true,
		enabled,
		select: (assets) => {
			let filteredAssets = assets

			filteredAssets = assets.filter((asset) => {
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

			if (searchTerm && searchTerm.length > 0) {
				filteredAssets = filteredAssets.filter((asset) => asset.tickerName.toLowerCase().includes(searchTerm.toLowerCase()) || asset.tickerSymbol.toLowerCase().includes(searchTerm.toLowerCase()))
			}
			return filteredAssets
		}
	})
}
