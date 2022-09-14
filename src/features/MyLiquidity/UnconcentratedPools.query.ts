import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { FilterType } from '~/data/filter'
import { assetMapping, AssetType } from '~/data/assets'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'

export const fetchPools = async ({ program, userPubKey, setStartTimer }: { program: Incept, userPubKey: PublicKey | null, setStartTimer: (start: boolean) => void}) => {
	if (!userPubKey) return []

  console.log('fetchPools :: UnconcentratedPools.query')
	// start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

	await program.loadManager()
	let iassetInfos : number[][] = []

  try {
    iassetInfos = await program.getUserLiquidityInfos()
  } catch (e) {
    console.error(e)
  }

	const result: PoolList[] = []

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

	// const result2: PoolList[] = [
	//   {
	//     id: 0,
	//     tickerName: 'iSolana',
	//     tickerSymbol: 'iSOL',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	//     price: 160.51,
  //     assetType: AssetType.Stocks,
	//     liquidityAsset: 90.11,
	//     liquidityUSD: 111.48,
	//     liquidityVal: 15898343,
	//   },
  //   {
	//     id: 1,
	//     tickerName: 'iSolana',
	//     tickerSymbol: 'iSOL',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	//     price: 160.51,
  //     assetType: AssetType.Stocks,
	//     liquidityAsset: 90.11,
	//     liquidityUSD: 111.48,
	//     liquidityVal: 15898343,
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
	price: number
	assetType: number
	liquidityAsset: number
	liquidityUSD: number
	liquidityVal: number
}

export function useUnconcentPoolsQuery({ userPubKey, filter, refetchOnMount, enabled = true }: GetPoolsProps) {
  const { getInceptApp } = useIncept()
	const { setStartTimer } = useDataLoading()
  return useQuery(['unconcentPools', userPubKey, filter], () => fetchPools({ program: getInceptApp(), userPubKey, setStartTimer }), {
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