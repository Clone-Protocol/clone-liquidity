import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { FilterType } from '~/data/filter'
import { assetMapping, AssetType } from '~/data/assets'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getUserLiquidityInfos } from '~/utils/user'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
export const fetchPools = async ({ program, userPubKey, setStartTimer }: { program: InceptClient, userPubKey: PublicKey | null, setStartTimer: (start: boolean) => void }) => {
	if (!userPubKey) return []

	console.log('fetchPools :: UnconcentratedPools.query')
	// start timer in data-loading-indicator
	setStartTimer(false);
	setStartTimer(true);

	await program.loadManager()
	const result: PoolList[] = []

	const [tokenDataResult, liquidityPositionsResult] = await Promise.allSettled([
		program.getTokenData(), program.getLiquidityPositions()
	]);

	if (tokenDataResult.status === "fulfilled" && liquidityPositionsResult.status === "fulfilled") {
		let iassetInfos = getUserLiquidityInfos(tokenDataResult.value, liquidityPositionsResult.value)
		let i = 0
		for (const info of iassetInfos) {
			const { tickerName, tickerSymbol, tickerIcon, assetType } = assetMapping(Number(info[0]))

			result.push({
				id: i,
				tickerName: tickerName,
				tickerSymbol: tickerSymbol,
				tickerIcon: tickerIcon,
				price: info[1],
				assetType: assetType,
				liquidityAsset: info[2],
				liquidityUSD: info[3],
				liquidityVal: info[3] * 2,
			})
			i++
		}
	}

	return result
}

interface GetPoolsProps {
	userPubKey: PublicKey | null
	filter: FilterType
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
	enabled?: boolean
}

export interface PoolList {
	id: number
	tickerName: string
	tickerSymbol: string
	tickerIcon: string
	price: number
	assetType: number
	liquidityAsset: number
	liquidityUSD: number
	liquidityVal: number
}

export function useUnconcentPoolsQuery({ userPubKey, filter, refetchOnMount, enabled = true }: GetPoolsProps) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setStartTimer } = useDataLoading()
	if (wallet) {
		return useQuery(['unconcentPools', wallet, userPubKey, filter], () => fetchPools({ program: getInceptApp(wallet), userPubKey, setStartTimer }), {
			refetchOnMount,
			refetchInterval: REFETCH_CYCLE,
			refetchIntervalInBackground: true,
			enabled,
			select: (assets) => {
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
		})
	} else {
		return useQuery(['unconcentPools'], () => [])
	}
}