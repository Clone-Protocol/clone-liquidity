import { Query, useQuery } from 'react-query'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { assetMapping, AssetType } from '~/data/assets'
import { FilterType } from '~/data/filter'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getiAssetInfos } from '~/utils/assets';
import { AnchorProvider } from "@coral-xyz/anchor";
import { getNetworkDetailsFromEnv } from 'incept-protocol-sdk/sdk/src/network'
import { PublicKey, Connection } from "@solana/web3.js";

export const fetchAssets = async ({ setStartTimer }: { setStartTimer: (start: boolean) => void }) => {
	console.log('fetchAssets')
	// start timer in data-loading-indicator
	setStartTimer(false);
	setStartTimer(true);

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
	const program = new InceptClient(network.incept, provider)

	await program.loadManager()
	const tokenData = await program.getTokenData();
	const iassetInfos = getiAssetInfos(tokenData);

	const result: AssetList[] = []

	for (const info of iassetInfos) {
		let { tickerName, tickerSymbol, tickerIcon, assetType } = assetMapping(info.poolIndex)
		result.push({
			id: info.poolIndex,
			tickerName: tickerName,
			tickerSymbol: tickerSymbol,
			tickerIcon: tickerIcon,
			price: info.poolPrice,
			assetType: assetType,
			liquidity: parseInt(info.liquidity.toString()),
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
	const { setStartTimer } = useDataLoading()

	let queryFunc
	try {
		queryFunc = () => fetchAssets({ setStartTimer })
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
