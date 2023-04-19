import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from 'incept-protocol-sdk/sdk/src/incept'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { TokenData, Comet } from 'incept-protocol-sdk/sdk/src/interfaces'
import { getHealthScore, getILD, getEffectiveUSDCollateralValue } from "incept-protocol-sdk/sdk/src/healthscore"
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { fetchBalance } from '~/features/Borrow/Balance.query'

export const fetchLiquidityDetail = async ({
	program,
	userPubKey,
	index,
}: {
	program: InceptClient
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
	let hasNoCollateral = false
	let hasAlreadyPool = false
	if (cometResult.status === 'fulfilled') {
		// Only USDi for now.
		totalCollValue = toNumber(cometResult.value.collaterals[0].collateralAmount)
		comet = cometResult.value
		totalHealthScore = getHealthScore(tokenData, comet).healthScore
		hasNoCollateral = Number(comet.numCollaterals) === 0 || totalCollValue === 0

		for (let i = 0; i < Number(comet.numPositions); i++) {
			const poolIndex = Number(comet.positions[i].poolIndex)
			if (assetId === poolIndex) {
				hasAlreadyPool = true
				break;
			}
		}
	}

	return {
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		price,
		totalCollValue,
		totalHealthScore,
		tokenData: tokenDataResult.value,
		comet,
		hasNoCollateral,
		hasAlreadyPool
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
	hasNoCollateral: boolean
	hasAlreadyPool: boolean
}

interface GetProps {
	userPubKey: PublicKey | null
	index: number
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
	enabled?: boolean
}

export function useLiquidityDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	if (wallet) {
		return useQuery(
			['liquidityPosition', wallet, userPubKey, index],
			() => fetchLiquidityDetail({ program: getInceptApp(wallet), userPubKey, index }),
			{
				refetchOnMount,
				enabled,
			}
		)
	} else {
		return useQuery(['liquidityPosition'], () => { })
	}
}


export const fetchCloseLiquidityPosition = async ({
	program,
	userPubKey,
	index,
	setStartTimer,
}: {
	program: InceptClient
	userPubKey: PublicKey | null
	index: number
	setStartTimer: (start: boolean) => void
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
	const iassetMint = pool.assetInfo.iassetMint
	const positionLpTokens = toNumber(position.liquidityTokenValue)

	const balance = await fetchBalance({
		program,
		userPubKey,
		index: poolIndex,
		setStartTimer
	})

	const {iAssetILD, usdiILD, oraclePrice } = getILD(tokenData, comet, poolIndex)[0];

	let assetId = poolIndex
	const { tickerIcon, tickerName, tickerSymbol } = assetMapping(assetId)
	let price = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)

	let currentHealthScore = getHealthScore(tokenData, comet)
	let prevHealthScore = currentHealthScore.healthScore
	const totalCollateralAmount = getEffectiveUSDCollateralValue(
		tokenData,
		comet
	);

	let ildInUsdi = usdiILD > 0
	let ildDebt = ildInUsdi ? usdiILD : iAssetILD
	let ildDebtDollarPrice = ildInUsdi ? 1 : oraclePrice
	let healthScore = prevHealthScore + toNumber(pool.assetInfo.ilHealthScoreCoefficient) * ildDebt * ildDebtDollarPrice / totalCollateralAmount
	let isValidToClose = ildInUsdi ? balance?.usdiVal! >= usdiILD : balance?.iassetVal! >= iAssetILD

	return {
		tickerIcon,
		tickerName,
		tickerSymbol,
		price,
		tokenData: tokenDataResult.value,
		comet,
		healthScore,
		prevHealthScore,
		ildDebt,
		ildDebtDollarPrice,
		iassetVal: balance?.iassetVal!,
		usdiVal: balance?.usdiVal!,
		isValidToClose,
		ildInUsdi,
		iassetMint,
		positionLpTokens
	}
}

export interface CloseLiquidityPositionInfo {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string
	price: number
	tokenData: TokenData
	comet: Comet | undefined
	healthScore: number
	prevHealthScore: number
	ildDebt: number
	ildDebtDollarPrice: number
	iassetVal?: number
	usdiVal?: number
	isValidToClose: boolean
}

export function useLiquidityPositionQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	const { setStartTimer } = useDataLoading()

	if (wallet) {
		return useQuery(
			['closeLiquidityPosition', wallet, userPubKey, index],
			() => fetchCloseLiquidityPosition({ program: getInceptApp(wallet), userPubKey, index, setStartTimer }),
			{
				refetchOnMount,
				refetchInterval: REFETCH_CYCLE,
				refetchIntervalInBackground: true,
				enabled,
			}
		)
	} else {
		return useQuery(['closeLiquidityPosition'], () => { })
	}
}


