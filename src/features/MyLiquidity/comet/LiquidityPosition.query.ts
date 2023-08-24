import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from 'clone-protocol-sdk/sdk/src/clone'
import { assetMapping } from 'src/data/assets'
import { useClone } from '~/hooks/useClone'
import { getHealthScore, getILD } from "clone-protocol-sdk/sdk/src/healthscore"
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { fetchBalance } from '~/features/Borrow/Balance.query'
import { calculatePoolAmounts } from 'clone-protocol-sdk/sdk/src/utils'
import { Comet, Pools } from 'clone-protocol-sdk/sdk/generated/clone'

export const fetchLiquidityDetail = async ({
	program,
	userPubKey,
	index,
}: {
	program: CloneClient
	userPubKey: PublicKey | null
	index: number
}) => {
	if (!userPubKey) return

	const [poolsData, oraclesData, userAccountData] = await Promise.allSettled([
		program.getPools(), program.getOracles(), program.getUserAccount()
	]);

	if (poolsData.status === 'rejected' || oraclesData.status === 'rejected')
		return;

	const pools = poolsData.value
	const pool = pools.pools[index]

	let assetId = index
	const { tickerIcon, tickerName, tickerSymbol } = assetMapping(assetId)
	let { poolOnusd, poolOnasset } = calculatePoolAmounts(
		toNumber(pool.collateralIld),
		toNumber(pool.onassetIld),
		toNumber(pool.committedCollateralLiquidity),
		toNumber(pool.assetInfo.price)
	)
	const price = poolOnusd / poolOnasset

	let totalCollValue = 0
	let totalHealthScore = 0
	let comet;
	let hasNoCollateral = false
	let hasAlreadyPool = false
	if (userAccountData.status === 'fulfilled') {
		const comet = userAccountData.value.comet
		totalCollValue = Number(comet.collateralAmount)
		totalHealthScore = getHealthScore(oraclesData.value, pools, comet, program.clone.collateral).healthScore
		hasNoCollateral = totalCollValue === 0

		for (let i = 0; i < Number(comet.positions.length); i++) {
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
		pools: poolsData.value,
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
	pools: Pools,
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
	const { getCloneApp } = useClone()
	if (wallet) {
		return useQuery(
			['liquidityPosition', wallet, userPubKey, index],
			async () => fetchLiquidityDetail({ program: await getCloneApp(wallet), userPubKey, index }),
			{
				refetchOnMount,
				enabled,
			}
		)
	} else {
		return useQuery(['liquidityPosition'], () => { return null })
	}
}


export const fetchCloseLiquidityPosition = async ({
	program,
	userPubKey,
	index,
	setStartTimer,
}: {
	program: CloneClient
	userPubKey: PublicKey | null
	index: number
	setStartTimer: (start: boolean) => void
}) => {
	if (!userPubKey) return

	// start timer in data-loading-indicator
	setStartTimer(false);
	setStartTimer(true);

	const [poolsData, oraclesData, accountData] = await Promise.allSettled([program.getPools(), program.getOracles(), program.getUserAccount()])

	if (poolsData.status === 'rejected' || oraclesData.status === 'rejected' || accountData.status === 'rejected') return

	const pools = poolsData.value
	const oracles = oraclesData.value
	const comet = accountData.value.comet
	const collateral = program.clone.collateral
	const position = comet.positions[index]
	const poolIndex = Number(position.poolIndex)
	const pool = pools.pools[poolIndex]
	const onassetMint = pool.assetInfo.onassetMint

	const balance = await fetchBalance({
		program,
		userPubKey,
		index: poolIndex,
		setStartTimer
	})

	const { onAssetILD, collateralILD, oraclePrice } = getILD(collateral, pools, oracles, comet)[index];

	let assetId = poolIndex
	const committedCollateralLiquidity = toNumber(position.committedCollateralLiquidity)
	const { tickerIcon, tickerName, tickerSymbol } = assetMapping(assetId)
	let { poolCollateral, poolOnasset } = calculatePoolAmounts(
		toNumber(pool.onusdIld),
		toNumber(pool.onassetIld),
		committedCollateralLiquidity,
		oraclePrice
	)
	let price = poolCollateral / poolOnasset

	let currentHealthScore = getHealthScore(oracles, pools, comet, program.clone.collateral)
	let prevHealthScore = currentHealthScore.healthScore
	const totalCollateralAmount = getEffectiveUSDCollateralValue(
		pools,
		comet
	);

	let ildInCollateral = collateralILD > 0
	let ildDebt = ildInCollateral ? collateralILD : onAssetILD
	let ildDebtDollarPrice = ildInCollateral ? 1 : oraclePrice
	let ildDebtNotionalValue = ildDebtDollarPrice * ildDebt
	let healthScoreIncrease = (
		toNumber(pool.assetInfo.ilHealthScoreCoefficient) * ildDebtNotionalValue +
		committedCollateralLiquidity * toNumber(pool.assetInfo.positionHealthScoreCoefficient)
	) / totalCollateralAmount
	let healthScore = prevHealthScore + healthScoreIncrease
	let isValidToClose = ildInCollateral ? balance?.onusdVal! >= collateralILD : balance?.onassetVal! >= onAssetILD

	return {
		tickerIcon,
		tickerName,
		tickerSymbol,
		price,
		pools,
		comet,
		healthScore,
		prevHealthScore,
		collateralILD,
		onassetILD: onAssetILD,
		ildDebt,
		ildDebtNotionalValue,
		onassetVal: balance?.onassetVal!,
		onusdVal: balance?.onusdVal!,
		isValidToClose,
		ildInCollateral,
		onassetMint,
		committedCollateralLiquidity
	}
}

export interface CloseLiquidityPositionInfo {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string
	price: number
	pools: Pools
	comet: Comet | undefined
	healthScore: number
	prevHealthScore: number
	collateralILD: number
	onassetILD: number
	ildDebt: number
	ildDebtNotionalValue: number
	onassetVal: number
	collateralVal: number
	isValidToClose: boolean
	onassetMint: PublicKey
	committedCollateralLiquidity: number
}

export function useLiquidityPositionQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	const { setStartTimer } = useDataLoading()

	if (wallet) {
		return useQuery(
			['closeLiquidityPosition', wallet, userPubKey, index],
			async () => fetchCloseLiquidityPosition({ program: await getCloneApp(wallet), userPubKey, index, setStartTimer }),
			{
				refetchOnMount,
				refetchInterval: REFETCH_CYCLE,
				refetchIntervalInBackground: true,
				enabled,
			}
		)
	} else {
		return useQuery(['closeLiquidityPosition'], () => { return null })
	}
}


