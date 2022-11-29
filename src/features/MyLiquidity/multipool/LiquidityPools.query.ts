import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'incept-protocol-sdk/sdk/src/incept'
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getiAssetInfos } from '~/utils/assets'
import { assetMapping } from '~/data/assets'

export const fetchPools = async ({
	program,
	userPubKey,
	setStartTimer,
}: {
	program: Incept
	userPubKey: PublicKey | null
	setStartTimer: (start: boolean) => void
}) => {
	if (!userPubKey) return []

	await program.loadManager()

	console.log('fetchPools :: LiquidityPools.query')
	// start timer in data-loading-indicator
	setStartTimer(false)
	setStartTimer(true)

	const tokenData = await program.getTokenData()
	const assetInfos = getiAssetInfos(tokenData)

	let result = []

	for (let asset of assetInfos) {
		let { tickerIcon, tickerSymbol } = assetMapping(asset[0])
		result.push({
			id: asset[0],
			tickerSymbol,
			tickerIcon,
			totalLiquidity: asset[2],
			volume24H: 0,
			averageAPY: 0,
			isEnabled: true,
		})
	}

	// const result: PoolList[] = [
	// 	{
	// 		id: 0,
	// 		tickerSymbol: 'iEUR',
	// 		tickerIcon: '/images/assets/euro.png',
	// 		totalLiquidity: 10582845,
	// 		volume24H: 10582845,
	// 		averageAPY: 20.355,
	// 		isEnabled: false,
	// 	},
	// 	{
	// 		id: 1,
	// 		tickerSymbol: 'iEUR',
	// 		tickerIcon: '/images/assets/euro.png',
	// 		totalLiquidity: 10582845,
	// 		volume24H: 10582845,
	// 		averageAPY: 20.355,
	// 		isEnabled: true,
	// 	},
	// 	{
	// 		id: 2,
	// 		tickerSymbol: 'iEUR',
	// 		tickerIcon: '/images/assets/euro.png',
	// 		totalLiquidity: 10582845,
	// 		volume24H: 10582845,
	// 		averageAPY: 20.355,
	// 		isEnabled: true,
	// 	},
	// ]
	return result
}

interface GetPoolsProps {
	userPubKey: PublicKey | null
	refetchOnMount?: QueryObserverOptions['refetchOnMount']
	enabled?: boolean
}

export interface PoolList {
	id: number
	tickerSymbol: string
	tickerIcon: string
	totalLiquidity: number
	volume24H: number
	averageAPY: number
	isEnabled: boolean
}

export function useLiquidityPoolsQuery({ userPubKey, refetchOnMount, enabled = true }: GetPoolsProps) {
	const { getInceptApp } = useIncept()
	const { setStartTimer } = useDataLoading()

	return useQuery(
		['liquidityPools', userPubKey],
		() => fetchPools({ program: getInceptApp(), userPubKey, setStartTimer }),
		{
			refetchOnMount,
			refetchInterval: REFETCH_CYCLE,
			refetchIntervalInBackground: true,
			enabled,
		}
	)
}
