import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept, TokenData, Comet } from 'incept-protocol-sdk/sdk/src/incept'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'


export const fetchLiquidityDetail = async ({
	program,
	userPubKey,
	index,
	isEdit,
}: {
	program: Incept
	userPubKey: PublicKey | null
	index: number
	isEdit: boolean
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
	if (isEdit) {
		//@TODO: need to bind data by poolIndex not assetId
	}
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
	
	return {
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		price,
		totalCollValue,
		totalHealthScore,
		tokenData: tokenDataResult.value,
		comet
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
}

interface GetProps {
	userPubKey: PublicKey | null
	index: number
	isEdit: boolean
	refetchOnMount?: QueryObserverOptions['refetchOnMount']
	enabled?: boolean
}

export function useLiquidityDetailQuery({ userPubKey, index, isEdit, refetchOnMount, enabled = true }: GetProps) {
	const { getInceptApp } = useIncept()
	return useQuery(
		['liquidityPosition', userPubKey, index],
		() => fetchLiquidityDetail({ program: getInceptApp(), userPubKey, index, isEdit }),
		{
			refetchOnMount,
			enabled,
		}
	)
}
