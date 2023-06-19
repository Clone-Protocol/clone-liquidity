import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient, DEVNET_TOKEN_SCALE } from 'incept-protocol-sdk/sdk/src/clone'
import { Comet, TokenData } from "incept-protocol-sdk/sdk/src/interfaces"
import { getHealthScore, getILD } from "incept-protocol-sdk/sdk/src/healthscore"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { assetMapping } from '~/data/assets'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { Collateral as StableCollateral, collateralMapping } from '~/data/assets'

export const fetchInfos = async ({
	program,
	userPubKey,
	setStartTimer,
}: {
	program: CloneClient
	userPubKey: PublicKey | null
	setStartTimer: (start: boolean) => void
}) => {
	if (!userPubKey) return

	await program.loadClone()

	console.log('fetchInfos :: MultipoolInfo.query')
	// start timer in data-loading-indicator
	setStartTimer(false)
	setStartTimer(true)


	let healthScore = 0
	let totalCollValue = 0
	let totalLiquidity = 0
	let hasNoCollateral = false
	let collaterals: Collateral[] = [];
	let positions: LiquidityPosition[] = [];

	const [cometResult, tokenDataResult] = await Promise.allSettled([
		program.getComet(), program.getTokenData()
	]);


	if (cometResult.status === "fulfilled" && tokenDataResult.status === "fulfilled") {
		collaterals = extractCollateralInfo(cometResult.value)
		positions = extractLiquidityPositionsInfo(cometResult.value, tokenDataResult.value)

		collaterals.forEach(c => {
			totalCollValue += c.collAmount * c.collAmountDollarPrice
		});
		positions.forEach(p => {
			totalLiquidity += p.liquidityDollarPrice
		})
		hasNoCollateral = totalCollValue === 0
		healthScore = getHealthScore(tokenDataResult.value, cometResult.value).healthScore
	}

	const result = {
		healthScore,
		totalCollValue,
		totalLiquidity,
		collaterals,
		hasNoCollateral,
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
	const onUSDInfo = collateralMapping(StableCollateral.onUSD)

	for (let i = 0; i < Number(comet.numCollaterals); i++) {
		// For now only handle onUSD
		if (Number(comet.collaterals[i].collateralIndex) === 0) {
			result.push(
				{
					tickerIcon: onUSDInfo.collateralIcon,
					tickerSymbol: onUSDInfo.collateralSymbol,
					tickerName: onUSDInfo.collateralName,
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
	ildValue: number,
	ildInUsdi: boolean
}


const extractLiquidityPositionsInfo = (comet: Comet, tokenData: TokenData): LiquidityPosition[] => {
	let result: LiquidityPosition[] = [];
	
	const ildInfo = getILD(tokenData, comet)

	for (let i = 0; i < comet.numPositions.toNumber(); i++) {
		// For now only handle onUSD
		const position = comet.positions[i];
		const poolIndex = Number(position.poolIndex)
		const info = assetMapping(poolIndex);

		const [ildValue, ildInUsdi] = (() => {
			const info = ildInfo[i];
			if (info.onAssetILD > 0) {
				return [info.onAssetILD, false]
			}
			if (info.onusdILD > 0) {
				return [info.onusdILD, true]
			}
			return [0, true]
		})();

		result.push(
			{
				tickerIcon: info.tickerIcon,
				tickerSymbol: info.tickerSymbol,
				tickerName: info.tickerName,
				liquidityDollarPrice: toNumber(position.committedOnusdLiquidity) * 2,
				ildValue,
				positionIndex: i,
				poolIndex,
				ildInUsdi
			} as LiquidityPosition
		)
	}

	return result;
}

export function useMultipoolInfoQuery({ userPubKey, refetchOnMount, enabled = true }: GetPoolsProps) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useIncept()
	const { setStartTimer } = useDataLoading()

	let queryFunc
	try {
		const program = getCloneApp(wallet)
		queryFunc = () => fetchInfos({ program, userPubKey, setStartTimer })
	} catch (e) {
		console.error(e)
		queryFunc = () => { }
	}

	return useQuery(
		['multipoolInfos', wallet, userPubKey],
		queryFunc,
		{
			refetchOnMount,
			refetchInterval: REFETCH_CYCLE,
			refetchIntervalInBackground: true,
			enabled,
		}
	)
}
