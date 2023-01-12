import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { FilterType } from '~/data/filter'
import { useDataLoading } from '~/hooks/useDataLoading'
import { assetMapping, collateralMapping, AssetType } from '~/data/assets'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { getUserSinglePoolCometInfos } from '~/utils/user'

export const fetchPools = async ({ program, userPubKey, setStartTimer }: { program: Incept, userPubKey: PublicKey | null, setStartTimer: (start: boolean) => void}) => {
	if (!userPubKey) return []

	console.log('fetchPools :: CometPools.query')
	// start timer in data-loading-indicator
	setStartTimer(false);
	setStartTimer(true);

	await program.loadManager();
	const result: PoolList[] = []

	const [tokenDataResult, singlePoolCometResult] = await Promise.allSettled([
		program.getTokenData(), program.getSinglePoolComets()
	]);

	if (tokenDataResult.status === "fulfilled" && singlePoolCometResult.status === "fulfilled") {

		let cometInfos = getUserSinglePoolCometInfos(program.calculateEditCometSinglePoolWithUsdiBorrowed, tokenDataResult.value, singlePoolCometResult.value);
		console.log('cometInfos', cometInfos)
	
		let i = 0
		for (const info of cometInfos) {
			const hasPool = Number(info[info.length-1])
	
			const { collateralName, collateralType } = collateralMapping(Number(info[1]))
			// unless poolIndex is 255
			if (hasPool) {
				const { tickerName, tickerSymbol, tickerIcon, assetType } = assetMapping(Number(info[0]))
	
				const healthData = program.getSinglePoolHealthScore(i, tokenDataResult.value, singlePoolCometResult.value)
				let healthScore = healthData.healthScore

	
				result.push({
					id: i,
					tickerName: tickerName,
					tickerSymbol: tickerSymbol,
					tickerIcon: tickerIcon,
					collateralName: collateralName,
					assetType: assetType,
					collateralType: collateralType,
					iPrice: Number(info[2]),
					cPrice: Number(info[3]),
					fromPriceRange: Number(info[4]),
					toPriceRange: Number(info[5]),
					collateral: Number(info[6]),
					ildIsIasset: Boolean(info[7]),
					ild: Number(healthData.ILD),
					borrowedIasset: Number(info[9]),
					borrowedUsdi: Number(info[10]),
					liquidityTokenAmount: Number(info[11]),
					healthScore
				})
			} else {
				result.push({
					id: i,
					tickerName: '',
					tickerSymbol: '',
					tickerIcon: '',
					collateralName: collateralName,
					assetType: 0,
					collateralType: collateralType,
					iPrice: 0,
					cPrice: 0,
					fromPriceRange: 0,
					toPriceRange: 0,
					collateral: Number(info[6]),
					ildIsIasset: false,
					ild: 0,
					borrowedIasset: 0,
					borrowedUsdi: 0,
					liquidityTokenAmount: 0,
					healthScore: 0
				})
			}
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
	collateralName: string
	assetType: number
	collateralType: number
	iPrice: number
	cPrice: number
	fromPriceRange: number
	toPriceRange: number
	collateral: number
	ildIsIasset: boolean
	ild: number
	borrowedIasset: number
	borrowedUsdi: number
	liquidityTokenAmount: number
  healthScore: number
}

export function useCometPoolsQuery({ userPubKey, filter, refetchOnMount, enabled = true }: GetPoolsProps) {
  const { getInceptApp } = useIncept()
	const { setStartTimer } = useDataLoading()

  return useQuery(['cometPools', userPubKey, filter], () => fetchPools({ program: getInceptApp(), userPubKey, setStartTimer }), {
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
}