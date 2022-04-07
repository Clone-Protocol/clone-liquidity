import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { useIncept } from '~/hooks/useIncept'
import { FilterType } from '~/data/filter'
import { assetMapping, collateralMapping } from '~/data/assets'

export const fetchPools = async ({ program, userPubKey, filter }: { program: Incept, userPubKey: PublicKey | null, filter: string}) => {
	if (!userPubKey) return []

	await program.loadManager()
	const cometInfos = await program.getUserCometInfos()

	const result: PoolList[] = []

	let i = 0
	for (const info of cometInfos) {
    const { tickerName, tickerSymbol, tickerIcon, assetType } = assetMapping(Number(info[0]))
    const { collateralName, collateralType } = collateralMapping(Number(info[1]))
    
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
		})

    i++
	}

	// const result: PoolList[] = [
	//   {
	//     id: 1,
	//     tickerName: 'iSolana',
	//     tickerSymbol: 'iSOL',
	//     tickerIcon: '/images/assets/ethereum-eth-logo.svg',
	//     iPrice: 160.51,
	//     cPrice: 100.20,
	//     fromPriceRange: 90.11,
	//     toPriceRange: 111.48,
	//     collateral: 15898343,
	//     ild: 28.9
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
}

export function useCometPoolsQuery({ userPubKey, filter, refetchOnMount, enabled = true }: GetPoolsProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['cometPools', userPubKey, filter], () => fetchPools({ program: getInceptApp(), userPubKey, filter }), {
    refetchOnMount,
    enabled
  })
}