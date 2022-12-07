import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept, TokenData, Comet } from 'incept-protocol-sdk/sdk/src/incept'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
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

	const [tokenDataResult, cometResult, healthScoreResult] = await Promise.allSettled([
		program.getTokenData(), program.getComet(), program.getHealthScore()
	]);

	if (tokenDataResult.status === 'rejected')
		return;

	const tokenData = tokenDataResult.value
	const pool = tokenData.pools[index]

	let assetId = index	
	const { tickerIcon, tickerName, tickerSymbol } = assetMapping(assetId)
	let price = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)

	let totalCollValue = 0
	let comet;
	if (cometResult.status === 'fulfilled') {
		// Only USDi for now.
		totalCollValue = toNumber(cometResult.value.collaterals[0].collateralAmount)
		comet = cometResult.value
	}

	let totalHealthScore = 0
	if (healthScoreResult.status === 'fulfilled')
		totalHealthScore = healthScoreResult.value.healthScore

  // @TODO : set data from contract
  let recenterCost = 50.35
  let recenterCostDollarPrice = 6700.51
  let recenterCollValue = 10300.32
  let healthScore = 95
  let prevHealthScore = 75
  let estimatedTotalCollValue = 51.456
  let estimatedTotalCollDollarPrice = 8403.59
	
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
    estimatedTotalCollDollarPrice
	}
}

export interface PositionInfo {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string
	price: number
	totalCollValue: number
	totalHealthScore: number
	tokenData: TokenData,
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
	refetchOnMount?: QueryObserverOptions['refetchOnMount']
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
