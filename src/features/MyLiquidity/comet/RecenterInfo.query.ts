// @Deprecated
import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from 'clone-protocol-sdk/sdk/src/clone'
import { TokenData, Comet } from 'clone-protocol-sdk/sdk/src/interfaces'
import { assetMapping } from 'src/data/assets'
import { useClone } from '~/hooks/useClone'
import { toNumber } from 'clone-protocol-sdk/sdk/src/decimal'
import { recenterProcedureInstructions } from 'clone-protocol-sdk/sdk/src/utils'
import { getHealthScore } from "clone-protocol-sdk/sdk/src/healthscore"
import { fetchBalance } from '~/features/Borrow/Balance.query'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'

export const fetchRecenterInfo = async ({
	program,
	userPubKey,
	index
}: {
	program: CloneClient
	userPubKey: PublicKey | null
	index: number
}) => {
	if (!userPubKey) return

	await program.loadClone()

	const [tokenDataResult, cometResult] = await Promise.allSettled([program.getTokenData(), program.getComet()])

	if (tokenDataResult.status === 'rejected' || cometResult.status === 'rejected') return

	const tokenData = tokenDataResult.value
	const comet = cometResult.value

	const recenterInfo = recenterProcedureInstructions(program, comet, tokenData, index, PublicKey.default, PublicKey.default, PublicKey.default, PublicKey.default)
	const position = comet.positions[index]
	const poolIndex = Number(position.poolIndex)
	const pool = tokenData.pools[poolIndex]

	const balance = await fetchBalance({
		program,
		userPubKey,
		index: poolIndex,
		setStartTimer
	})

	let assetId = poolIndex
	const { tickerIcon, tickerName, tickerSymbol } = assetMapping(assetId)
	let price = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)
	let initPrice = toNumber(position.borrowedUsdi) / toNumber(position.borrowedIasset)

	let currentHealthScore = getHealthScore(tokenData, comet)

	let recenterCost = recenterInfo.usdiCost
	let prevHealthScore = currentHealthScore.healthScore
	let healthScore = recenterInfo.healthScore

	// Only onUSD for now.
	let totalCollValue = toNumber(cometResult.value.collaterals[0].collateralAmount)
	let totalHealthScore = healthScore

	let recenterCostDollarPrice = 1
	let recenterCollValue = recenterCost * recenterCostDollarPrice
	let estimatedTotalCollValue = totalCollValue - recenterCollValue
	let estimatedTotalCollDollarPrice = estimatedTotalCollValue
	let isValidToRecenter = (recenterCost > 0 && Math.abs(initPrice - price) / initPrice >= 0.001) && balance?.usdiVal! >= recenterCost

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
		iassetVal: balance?.iassetVal!,
		usdiVal: balance?.usdiVal!,
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
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()

	if (wallet) {
		return useQuery(
			['recenterInfo', wallet, userPubKey, index],
			() => fetchRecenterInfo({ program: getCloneApp(wallet), userPubKey, index }),
			{
				refetchOnMount,
				refetchInterval: REFETCH_CYCLE,
				refetchIntervalInBackground: true,
				enabled,
			}
		)
	} else {
		return useQuery(['recenterInfo'], () => { })
	}
}
