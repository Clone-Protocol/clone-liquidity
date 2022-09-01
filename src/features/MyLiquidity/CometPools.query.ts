import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { FilterType } from '~/data/filter'
import { assetMapping, collateralMapping } from '~/data/assets'

export const fetchPools = async ({ program, userPubKey, filter }: { program: Incept, userPubKey: PublicKey | null, filter: string}) => {
	if (!userPubKey) return []

	await program.loadManager()

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
    const { tickerName, tickerSymbol, tickerIcon, assetType } = assetMapping(Number(info[0]))
    const { collateralName, collateralType } = collateralMapping(Number(info[1]))

		let healthScore = 0
		try {
			const healthData = await program.getSinglePoolHealthScore(i)
			healthScore = healthData.healthScore
		} catch (e) {
			console.error(e)
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
  return useQuery(['cometPools', userPubKey, filter], () => fetchPools({ program: getInceptApp(), userPubKey, filter }), {
    refetchOnMount,
    enabled
  })
}