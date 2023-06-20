import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from 'incept-protocol-sdk/sdk/src/clone'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { TokenData, Comet } from 'incept-protocol-sdk/sdk/src/interfaces'
import { getHealthScore, getILD, getEffectiveUSDCollateralValue } from "incept-protocol-sdk/sdk/src/healthscore"
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { fetchBalance } from '~/features/Borrow/Balance.query'
import { calculatePoolAmounts } from 'incept-protocol-sdk/sdk/src/utils'

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

	await program.loadClone()

	const [tokenDataResult, cometResult] = await Promise.allSettled([
		program.getTokenData(), program.getComet()
	]);

	if (tokenDataResult.status === 'rejected')
		return;

	const tokenData = tokenDataResult.value
	const pool = tokenData.pools[index]

	let assetId = index
	const { tickerIcon, tickerName, tickerSymbol } = assetMapping(assetId)
	let {poolOnusd, poolOnasset} = calculatePoolAmounts(
        toNumber(pool.onusdIld),
        toNumber(pool.onassetIld),
        toNumber(pool.committedOnusdLiquidity),
        toNumber(pool.assetInfo.price)
      )
	const price = poolOnusd / poolOnasset

	let totalCollValue = 0
	let totalHealthScore = 0
	let comet;
	let hasNoCollateral = false
	let hasAlreadyPool = false
	if (cometResult.status === 'fulfilled') {
		// Only onUSD for now.
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
	const { getCloneApp } = useIncept()
	if (wallet) {
		return useQuery(
			['liquidityPosition', wallet, userPubKey, index],
			() => fetchLiquidityDetail({ program: getCloneApp(wallet), userPubKey, index }),
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
	program: CloneClient
	userPubKey: PublicKey | null
	index: number
	setStartTimer: (start: boolean) => void
}) => {
	if (!userPubKey) return

	await program.loadClone()

	const [tokenDataResult, cometResult] = await Promise.allSettled([program.getTokenData(), program.getComet()])

	if (tokenDataResult.status === 'rejected' || cometResult.status === 'rejected') return

	const tokenData = tokenDataResult.value
	const comet = cometResult.value

	const position = comet.positions[index]
	const poolIndex = Number(position.poolIndex)
	const pool = tokenData.pools[poolIndex]
	const onassetMint = pool.assetInfo.onassetMint

	const balance = await fetchBalance({
		program,
		userPubKey,
		index: poolIndex,
		setStartTimer
	})

	const { onAssetILD, onusdILD, oraclePrice } = getILD(tokenData, comet)[index];

	let assetId = poolIndex
	const committedOnusdLiquidity = toNumber(pool.committedOnusdLiquidity)
	const { tickerIcon, tickerName, tickerSymbol } = assetMapping(assetId)
	let {poolOnusd, poolOnasset} = calculatePoolAmounts(
        toNumber(pool.onusdIld),
        toNumber(pool.onassetIld),
        committedOnusdLiquidity,
        oraclePrice
      )
	let price = poolOnusd / poolOnasset

	let currentHealthScore = getHealthScore(tokenData, comet)
	let prevHealthScore = currentHealthScore.healthScore
	const totalCollateralAmount = getEffectiveUSDCollateralValue(
		tokenData,
		comet
	);

	let ildInOnusd = onusdILD > 0
	let ildDebt = ildInOnusd ? onusdILD : onAssetILD
	let ildDebtDollarPrice = ildInOnusd ? 1 : oraclePrice
	let ildDebtNotionalValue = ildDebtDollarPrice * ildDebt
	let healthScore = prevHealthScore + toNumber(pool.assetInfo.ilHealthScoreCoefficient) * ildDebtNotionalValue / totalCollateralAmount
	let isValidToClose = ildInOnusd ? balance?.onusdVal! >= onusdILD : balance?.onassetVal! >= onAssetILD

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
		ildDebtNotionalValue,
		onassetVal: balance?.onassetVal!,
		onusdVal: balance?.onusdVal!,
		isValidToClose,
		ildInOnusd,
		onassetMint,
		committedOnusdLiquidity
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
	ildDebtNotionalValue: number
	onassetVal: number
	onusdVal: number
	isValidToClose: boolean
	onassetMint: PublicKey
	committedOnusdLiquidity: number
}

export function useLiquidityPositionQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useIncept()
	const { setStartTimer } = useDataLoading()

	if (wallet) {
		return useQuery(
			['closeLiquidityPosition', wallet, userPubKey, index],
			() => fetchCloseLiquidityPosition({ program: getCloneApp(wallet), userPubKey, index, setStartTimer }),
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


