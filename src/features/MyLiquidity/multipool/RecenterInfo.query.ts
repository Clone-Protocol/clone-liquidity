import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept, TokenData, Comet } from 'incept-protocol-sdk/sdk/src/incept'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'

export const fetchRecenterInfo = async ({
	program,
	userPubKey,
	index,
}: {
	program: Incept
	userPubKey: PublicKey | null
	index: number
}) => {
	if (!userPubKey) return

	await program.loadManager()

	const [tokenDataResult, cometResult] = await Promise.allSettled([program.getTokenData(), program.getComet()])

	if (tokenDataResult.status === 'rejected' || cometResult.status === 'rejected') return

	const tokenData = tokenDataResult.value
	const comet = cometResult.value
	const position = comet.positions[index]
	const poolIndex = Number(position.poolIndex)
	const pool = tokenData.pools[poolIndex]

	let assetId = poolIndex
	const { tickerIcon, tickerName, tickerSymbol } = assetMapping(assetId)
	let price = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)
	let initPrice = toNumber(position.borrowedUsdi) / toNumber(position.borrowedIasset)

	let currentHealthScore = program.getHealthScore(tokenData, comet)

	let totalCollValue = 0
	let totalHealthScore = 0
	let recenterCost = 0
	let prevHealthScore = currentHealthScore.healthScore
	let healthScore = prevHealthScore

	// Only USDi for now.
	totalCollValue = toNumber(cometResult.value.collaterals[0].collateralAmount)
	totalHealthScore = program.getHealthScore(tokenData, comet).healthScore
	try {
		let recenterEstimation = program.calculateCometRecenterMultiPool(index, tokenData, comet)
		recenterCost = recenterEstimation.usdiCost
		healthScore = recenterEstimation.healthScore
	} catch (e) {
		console.log(e)
	}
	let recenterCostDollarPrice = 1
	let recenterCollValue = recenterCost * recenterCostDollarPrice
	let estimatedTotalCollValue = totalCollValue - recenterCollValue
	let estimatedTotalCollDollarPrice = estimatedTotalCollValue
	let isValidToRecenter = recenterCost > 0 && Math.abs(initPrice - price) / initPrice >= 0.001

	return {
		tickerIcon,
		tickerName,
		tickerSymbol,
		price,
		totalCollValue,
		totalHealthScore,
		tokenData: tokenDataResult.value,
		comet,
		recenterCost,
		recenterCostDollarPrice,
		recenterCollValue,
		healthScore,
		prevHealthScore,
		estimatedTotalCollValue,
		estimatedTotalCollDollarPrice,
		isValidToRecenter,
	}
}

export interface PositionInfo {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string
	price: number
	totalCollValue: number
	totalHealthScore: number
	tokenData: TokenData
	comet: Comet | undefined
	recenterCost: number
	recenterCostDollarPrice: number
	recenterCollValue: number
	healthScore: number
	prevHealthScore: number
	estimatedTotalCollValue: number
	estimatedTotalCollDollarPrice: number
}

interface GetProps {
	userPubKey: PublicKey | null
	index: number
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
	enabled?: boolean
}

export function useRecenterInfoQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
	const { getInceptApp } = useIncept()
	return useQuery(
		['recenterInfo', userPubKey, index],
		() => fetchRecenterInfo({ program: getInceptApp(), userPubKey, index }),
		{
			refetchOnMount,
			enabled,
		}
	)
}
