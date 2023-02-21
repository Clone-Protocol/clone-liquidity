import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from 'incept-protocol-sdk/sdk/src/incept'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { TokenData, Comet } from 'incept-protocol-sdk/sdk/src/interfaces'
import { getHealthScore } from "incept-protocol-sdk/sdk/src/healthscore"
import { useAnchorWallet } from '@solana/wallet-adapter-react'


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
		hasNoCollateral = Number(comet.numCollaterals) === 0

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
