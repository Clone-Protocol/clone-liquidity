import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from 'incept-protocol-sdk/sdk/src/incept'
import { useIncept } from '~/hooks/useIncept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { getUSDiAccount } from '~/utils/token_accounts'
import { getHealthScore } from "incept-protocol-sdk/sdk/src/healthscore"
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { Collateral as StableCollateral, collateralMapping } from '~/data/assets'

export const fetchDefaultCollateral = async ({
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

	let [cometResult, tokenDataResult, usdiAccountResult] = await Promise.allSettled([
		program.getComet(),
		program.getTokenData(),
		getUSDiAccount(program),
	])

	let balance = 0
	let collAmount = 0
	let prevHealthScore = 0

	if (usdiAccountResult.status === 'fulfilled' && usdiAccountResult.value !== undefined) {
		const tokenBalance = await program.connection.getTokenAccountBalance(usdiAccountResult.value!)
		balance = tokenBalance.value.uiAmount!
	}

	if (cometResult.status === 'fulfilled') {
		collAmount = toNumber(cometResult.value.collaterals[index].collateralAmount)
		if (tokenDataResult.status === 'fulfilled') {
			prevHealthScore = getHealthScore(tokenDataResult.value, cometResult.value).healthScore
		}
	}
	let collAmountDollarPrice = 1 // Since its USDi.
	let totalCollValue = collAmount * collAmountDollarPrice

	const onUSDInfo = collateralMapping(StableCollateral.onUSD)
	const tickerIcon = onUSDInfo.collateralIcon
	const tickerSymbol = onUSDInfo.collateralSymbol
	const tickerName = onUSDInfo.collateralSymbol

	return {
		tickerIcon,
		tickerName,
		tickerSymbol,
		balance,
		prevHealthScore,
		collAmount,
		collAmountDollarPrice,
		totalCollValue,
	}
}

interface GetProps {
	userPubKey: PublicKey | null
	index: number
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
	enabled?: boolean
}

export function useEditCollateralQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
	const wallet = useAnchorWallet()
	const { getInceptApp } = useIncept()
	if (wallet) {
		return useQuery(
			['editCollateral', wallet, userPubKey, index],
			() => fetchDefaultCollateral({ program: getInceptApp(wallet), userPubKey, index }),
			{
				refetchOnMount,
				enabled,
			}
		)
	} else {
		return useQuery(['editCollateral'], () => { })
	}
}
