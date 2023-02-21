import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from 'incept-protocol-sdk/sdk/src/incept'
import { Comet } from "incept-protocol-sdk/sdk/src/interfaces"
import { getHealthScore } from "incept-protocol-sdk/sdk/src/healthscore"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { assetMapping } from '~/data/assets'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

export const fetchInfos = async ({
	program,
	userPubKey,
	setStartTimer,
}: {
	program: InceptClient
	userPubKey: PublicKey | null
	setStartTimer: (start: boolean) => void
}) => {
	if (!userPubKey) return

	await program.loadManager()

	console.log('fetchInfos :: MultipoolInfo.query')
	// start timer in data-loading-indicator
	setStartTimer(false)
	setStartTimer(true)


	let healthScore = 0
	let totalCollValue = 0
	let totalLiquidity = 0
	let collaterals: Collateral[] = [];
	let positions: LiquidityPosition[] = [];

	const [cometResult, tokenDataResult] = await Promise.allSettled([
		program.getComet(), program.getTokenData()
	]);


	if (cometResult.status === "fulfilled") {
		collaterals = extractCollateralInfo(cometResult.value)
		positions = extractLiquidityPositionsInfo(cometResult.value)

		collaterals.forEach(c => {
			totalCollValue += c.collAmount * c.collAmountDollarPrice
		});
		positions.forEach(p => {
			totalLiquidity += p.liquidityDollarPrice
		})
		if (tokenDataResult.status === "fulfilled") {
			healthScore = getHealthScore(tokenDataResult.value, cometResult.value).healthScore
		}
	}

	const result = {
		healthScore,
		totalCollValue,
		totalLiquidity,
		collaterals,
		positions
	}

	return result
}

interface GetPoolsProps {
	userPubKey: PublicKey | null
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
	enabled?: boolean
}

export interface Collateral {
	tickerSymbol: string
	tickerIcon: string
	tickerName: string
	collAmount: number
	collAmountDollarPrice: number
}

const extractCollateralInfo = (comet: Comet): Collateral[] => {
	let result: Collateral[] = [];

	for (let i = 0; i < Number(comet.numCollaterals); i++) {
		// For now only handle USDi
		if (Number(comet.collaterals[i].collateralIndex) === 0) {
			result.push(
				{
					tickerIcon: '/images/assets/USDi.png',
					tickerSymbol: 'USDi',
					tickerName: 'USDi',
					collAmount: toNumber(comet.collaterals[i].collateralAmount),
					collAmountDollarPrice: 1
				} as Collateral
			)
		}
	}

	return result;
}

export interface LiquidityPosition {
	tickerSymbol: string
	tickerIcon: string
	tickerName: string
	liquidityDollarPrice: number
	positionIndex: number
	poolIndex: number
}


const extractLiquidityPositionsInfo = (comet: Comet): LiquidityPosition[] => {
	let result: LiquidityPosition[] = [];

	for (let i = 0; i < comet.numPositions.toNumber(); i++) {
		// For now only handle USDi
		const position = comet.positions[i];
		const poolIndex = Number(position.poolIndex)
		const info = assetMapping(poolIndex);

		result.push(
			{
				tickerIcon: info.tickerIcon,
				tickerSymbol: info.tickerSymbol,
				tickerName: info.tickerName,
				liquidityDollarPrice: toNumber(position.borrowedUsdi) * 2,
				positionIndex: i,
				poolIndex: poolIndex
			} as LiquidityPosition
		)
	}

	return result;
}

export function useMultipoolInfoQuery({ userPubKey, refetchOnMount, enabled = true }: GetPoolsProps) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setStartTimer } = useDataLoading()

	if (wallet) {
		return useQuery(
			['multipoolInfos', wallet, userPubKey],
			() => fetchInfos({ program: getInceptApp(wallet), userPubKey, setStartTimer }),
			{
				refetchOnMount,
				refetchInterval: REFETCH_CYCLE,
				refetchIntervalInBackground: true,
				enabled,
			}
		)
	} else {
		return useQuery(['multipoolInfos'], () => { })
	}
}
