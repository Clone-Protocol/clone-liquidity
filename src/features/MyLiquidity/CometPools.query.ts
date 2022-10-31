import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { FilterType } from '~/data/filter'
import { useDataLoading } from '~/hooks/useDataLoading'
import { assetMapping, collateralMapping, AssetType } from '~/data/assets'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'

export const fetchPools = async ({ program, userPubKey, setStartTimer }: { program: Incept, userPubKey: PublicKey | null, setStartTimer: (start: boolean) => void}) => {
	if (!userPubKey) return []

	console.log('fetchPools :: CometPools.query')
	// start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

	await program.loadManager()
	
	const spcomets = await program.getSinglePoolComets();
	console.log('sss', spcomets.numPositions.toString());
  for (let i = 0; i < spcomets.numCollaterals.toNumber(); i++) {
    let comet = await program.getSinglePoolComet(i);
    console.log('p',comet)
		console.log('f', comet.poolIndex.toString())
  }

	let cometInfos = []

	try {
		cometInfos = await program.getUserSinglePoolCometInfos()
	} catch (e) {
		console.error(e)
	}

	const result: PoolList[] = []

  console.log('cometInfos', cometInfos)

	let i = 0
	for (const info of cometInfos) {
		const hasPool = Number(info[info.length-1])

		const { collateralName, collateralType } = collateralMapping(Number(info[1]))
		// unless poolIndex is 255
		if (hasPool) {
			const { tickerName, tickerSymbol, tickerIcon, assetType } = assetMapping(Number(info[0]))

			let healthScore = 0
			try {
				const healthData = await program.getSinglePoolHealthScore(i)
				healthScore = healthData.healthScore
			} catch (e) {
				console.error('healthData', e)
			}

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
				ild: Number(info[8]),
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

	// const result2: PoolList[] = [
	//   {
	//     id: 1,
	//     tickerName: 'iSolana',
	//     tickerSymbol: 'iSOL',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
  //     collateralName: 'USDi',
  //     assetType: 0,
  //     collateralType: 0,
	//     iPrice: 160.51,
	//     cPrice: 100.20,
	//     fromPriceRange: 90.11,
	//     toPriceRange: 111.48,
	//     collateral: 15898343,
  //     ildIsIasset: false,
	//     ild: 28.9,
  //     borrowedIasset: 0,
  //     borrowedUsdi: 0,
  //     liquidityTokenAmount: 0,
  //     healthScore: 5
	//   },
	// ]
	return result
}

interface GetPoolsProps {
	userPubKey: PublicKey | null
	filter: FilterType
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
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