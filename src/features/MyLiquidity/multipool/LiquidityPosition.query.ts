import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept, TokenData, Comet } from 'incept-protocol-sdk/sdk/src/incept'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'


export const fetchLiquidityDetail = async ({
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

	const [tokenDataResult, cometResult] = await Promise.allSettled([
		program.getTokenData(), program.getComet()
	]);

	if (tokenDataResult.status === 'rejected')
		return;

	const tokenData = tokenDataResult.value
	const pool = tokenData.pools[index]

	let assetId = index
	const { tickerIcon, tickerName, tickerSymbol } = assetMapping(assetId)
	let price = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)

	let totalCollValue = 0
	let totalHealthScore = 0
	let comet;
	if (cometResult.status === 'fulfilled') {
		// Only USDi for now.
		totalCollValue = toNumber(cometResult.value.collaterals[0].collateralAmount)
		comet = cometResult.value
		totalHealthScore = program.getHealthScore(tokenData, comet).healthScore
	}

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
	refetchOnMount?: QueryObserverOptions['refetchOnMount']
	enabled?: boolean
}

export function useLiquidityDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
	const { getInceptApp } = useIncept()
	return useQuery(
		['liquidityPosition', userPubKey, index],
		() => fetchLiquidityDetail({ program: getInceptApp(), userPubKey, index }),
		{
			refetchOnMount,
			enabled,
		}
	)
}
