import { Query, useQuery } from '@tanstack/react-query'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { assetMapping, AssetType } from '~/data/assets'
import { FilterType } from '~/data/filter'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { fetch24hourVolume, getAggregatedPoolStats, getiAssetInfos } from '~/utils/assets';
import { useAtomValue } from 'jotai'
import { getCloneClient } from '../baseQuery';
import { cloneClient } from '../globalAtom'
import { fetchPythPriceHistory } from '~/utils/pyth'

export const fetchAssets = async ({ mainCloneClient }: { mainCloneClient?: CloneClient | null }) => {
	console.log('fetchAssets')

	let program
	if (mainCloneClient) {
		program = mainCloneClient
	} else {
		const { cloneClient: cloneProgram } = await getCloneClient()
		program = cloneProgram
	}

	const pools = await program.getPools();
	// const oracles = await program.getOracles();
	const iassetInfos = await getiAssetInfos(program.provider.connection, program);
	const poolStats = await getAggregatedPoolStats(pools)
	const dailyVolumeStats = await fetch24hourVolume()

	// Fetch Pyth
	let pythData
	try {
		pythData = await Promise.all(
			iassetInfos.map((info) => {
				let { pythSymbol } = assetMapping(info.poolIndex)
				return fetchPythPriceHistory(
					pythSymbol, '1D'
				)
			})
		)
	} catch (e) {
		console.error(e)
	}

	const result: AssetList[] = []

	for (let i = 0; i < iassetInfos.length; i++) {
		const info = iassetInfos[i]
		const { tickerName, tickerSymbol, tickerIcon, ticker, assetType } = assetMapping(info.poolIndex)
		const stats = poolStats[info.poolIndex]

		let change24h = 0
		if (pythData && pythData.length > 0) {
			const priceData = pythData[i]

			const openPrice = priceData[0] ? Number(priceData[0].price) : 0
			const closePrice = priceData[0] ? Number(priceData.at(-1)!.price) : 0
			change24h = priceData[0] ? (closePrice / openPrice - 1) * 100 : 0
		}

		result.push({
			id: info.poolIndex,
			tickerName,
			tickerSymbol,
			tickerIcon,
			ticker,
			price: info.poolPrice,
			assetType,
			liquidity: parseInt(info.liquidity.toString()),
			volume24h: dailyVolumeStats.get(info.poolIndex) ?? 0,
			change24h,
			feeRevenue24h: stats.fees,
			avgAPY24h: stats.liquidityUSD > 0 ? (365.25 * stats.fees / stats.liquidityUSD) * 100 : 0,
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
	ticker: string
	price: number
	assetType: number
	liquidity: number
	volume24h: number
	change24h: number
	feeRevenue24h: number
	avgAPY24h: number
}

export function useAssetsQuery({ filter, searchTerm, refetchOnMount, enabled = true }: GetAssetsProps) {
	const mainCloneClient = useAtomValue(cloneClient)

	let queryFunc
	try {
		queryFunc = () => fetchAssets({ mainCloneClient })
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
