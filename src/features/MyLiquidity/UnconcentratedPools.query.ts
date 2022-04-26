import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { useIncept } from '~/hooks/useIncept'
import { FilterType } from '~/data/filter'
import { assetMapping, AssetType } from '~/data/assets'

export const fetchPools = async ({ program, userPubKey, filter }: { program: Incept, userPubKey: PublicKey | null, filter: string}) => {
	if (!userPubKey) return []

	await program.loadManager()
	const iassetInfos = await program.getUserLiquidityInfos()

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

	const result2: PoolList[] = [
	  {
	    id: 0,
	    tickerName: 'iSolana',
	    tickerSymbol: 'iSOL',
	    tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	    price: 160.51,
      assetType: AssetType.Stocks,
	    liquidityAsset: 90.11,
	    liquidityUSD: 111.48,
	    liquidityVal: 15898343,
	  },
    {
	    id: 1,
	    tickerName: 'iSolana',
	    tickerSymbol: 'iSOL',
	    tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	    price: 160.51,
      assetType: AssetType.Stocks,
	    liquidityAsset: 90.11,
	    liquidityUSD: 111.48,
	    liquidityVal: 15898343,
	  },
	]
	return result2
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
  return useQuery(['unconcentPools', userPubKey, filter], () => fetchPools({ program: getInceptApp(), userPubKey, filter }), {
    refetchOnMount,
    enabled
  })
}