import { Query, useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { CloneClient, fromScale } from 'clone-protocol-sdk/sdk/src/clone'
import { useClone } from '~/hooks/useClone'
import { getCollateralAccount } from '~/utils/token_accounts'
import { getHealthScore } from "clone-protocol-sdk/sdk/src/healthscore"
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { Collateral as StableCollateral, collateralMapping } from '~/data/assets'

export const fetchDefaultCollateral = async ({
	program,
	userPubKey,
}: {
	program: CloneClient
	userPubKey: PublicKey | null
}) => {
	if (!userPubKey) return

	const [userAccountData, poolsData, oraclesData, collateralAccountResult] = await Promise.allSettled([
		program.getUserAccount(),
		program.getPools(),
		program.getOracles(),
		getCollateralAccount(program),
	])

	let balance = 0
	let collAmount = 0
	let prevHealthScore = 0
	let hasCometPositions = false

	if (collateralAccountResult.status === 'fulfilled' && collateralAccountResult.value !== undefined) {
		const tokenBalance = await program.provider.connection.getTokenAccountBalance(collateralAccountResult.value.address)
		balance = tokenBalance.value.uiAmount!
	}

	if (userAccountData.status === 'fulfilled') {
		const comet = userAccountData.value.comet
		collAmount = fromScale(comet.collateralAmount, program.clone.collateral.scale)
		hasCometPositions = comet.positions.length > 0
		if (poolsData.status === 'fulfilled' && oraclesData.status === 'fulfilled') {
			prevHealthScore = getHealthScore(oraclesData.value, poolsData.value, comet, program.clone.collateral).healthScore
		}
	}
	const collAmountDollarPrice = 1 // Since its USD.
	const totalCollValue = collAmount * collAmountDollarPrice

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
	refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
	enabled?: boolean
}

export function useEditCollateralQuery({ userPubKey, refetchOnMount, enabled = true }: GetProps) {
	const wallet = useAnchorWallet()
	const { getCloneApp } = useClone()
	if (wallet) {
		return useQuery(
			['editCollateral', wallet, userPubKey],
			async () => fetchDefaultCollateral({ program: await getCloneApp(wallet), userPubKey }),
			{
				refetchOnMount,
				enabled,
			}
		)
	} else {
		return useQuery(['editCollateral'], () => { return null })
	}
}
