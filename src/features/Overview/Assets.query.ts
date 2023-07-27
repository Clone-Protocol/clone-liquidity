import { Query, useQuery } from 'react-query'
import { CloneClient } from "clone-protocol-sdk/sdk/src/clone"
import { assetMapping, AssetType } from '~/data/assets'
import { FilterType } from '~/data/filter'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getAggregatedPoolStats, getiAssetInfos } from '~/utils/assets';
import { AnchorProvider } from "@coral-xyz/anchor";
import { getNetworkDetailsFromEnv } from 'clone-protocol-sdk/sdk/src/network'
import { PublicKey, Connection } from "@solana/web3.js";

export const fetchAssets = async () => {
	console.log('fetchAssets')

	// MEMO: to support provider without wallet adapter
	const network = getNetworkDetailsFromEnv()
	const new_connection = new Connection(network.endpoint)
	const provider = new AnchorProvider(
		new_connection,
		{
			signTransaction: () => Promise.reject(),
			signAllTransactions: () => Promise.reject(),
			publicKey: PublicKey.default, // MEMO: dummy pubkey
		},
		{}
	);
	// @ts-ignore
	const program = new CloneClient(network.clone, provider)

	await program.loadClone()
	const tokenData = await program.getTokenData();
	const iassetInfos = getiAssetInfos(tokenData);
	const poolStats = await getAggregatedPoolStats(tokenData)

	const result: AssetList[] = []

	for (const info of iassetInfos) {
		let { tickerName, tickerSymbol, tickerIcon, ticker, assetType } = assetMapping(info.poolIndex)
		const stats = poolStats[info.poolIndex]
		result.push({
			id: info.poolIndex,
			tickerName: tickerName,
			tickerSymbol: tickerSymbol,
			tickerIcon: tickerIcon,
			ticker: ticker,
			price: info.poolPrice,
			assetType: assetType,
			liquidity: parseInt(info.liquidity.toString()),
			volume24h: stats.volumeUSD,
			feeRevenue24h: stats.fees
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
	feeRevenue24h: number
}

export function useAssetsQuery({ filter, searchTerm, refetchOnMount, enabled = true }: GetAssetsProps) {
	let queryFunc
	try {
		queryFunc = () => fetchAssets()
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
