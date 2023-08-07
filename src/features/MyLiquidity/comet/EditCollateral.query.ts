import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient } from 'clone-protocol-sdk/sdk/src/clone'
import { useClone } from '~/hooks/useClone'
import { toNumber } from 'clone-protocol-sdk/sdk/src/decimal'
import { getOnUSDAccount } from '~/utils/token_accounts'
import { getHealthScore } from "clone-protocol-sdk/sdk/src/healthscore"
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { Collateral as StableCollateral, collateralMapping } from '~/data/assets'

export const fetchDefaultCollateral = async ({
	program,
	userPubKey,
	index,
}: {
	program: CloneClient
	userPubKey: PublicKey | null
	index: number
}) => {
	if (!userPubKey) return

	let [cometResult, tokenDataResult, usdiAccountResult] = await Promise.allSettled([
		program.getComet(),
		program.getTokenData(),
		getOnUSDAccount(program),
	])

	let balance = 0
	let collAmount = 0
	let prevHealthScore = 0
	let hasCometPositions = false

	if (usdiAccountResult.status === 'fulfilled' && usdiAccountResult.value !== undefined) {
		const tokenBalance = await program.provider.connection.getTokenAccountBalance(usdiAccountResult.value!)
		balance = tokenBalance.value.uiAmount!
	}

	if (cometResult.status === 'fulfilled') {
		collAmount = toNumber(cometResult.value.collaterals[index].collateralAmount)
		hasCometPositions = cometResult.value.numPositions.toNumber() > 0
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
		hasCometPositions
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
	const { getCloneApp } = useClone()
	if (wallet) {
		return useQuery(
			['editCollateral', wallet, userPubKey, index],
			() => fetchDefaultCollateral({ program: getCloneApp(wallet), userPubKey, index }),
			{
				refetchOnMount,
				enabled,
			}
		)
	} else {
		return useQuery(['editCollateral'], () => { })
	}
}
