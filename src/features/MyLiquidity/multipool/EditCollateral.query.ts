import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'incept-protocol-sdk/sdk/src/incept'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { getUSDiAccount } from '~/utils/token_accounts'

export const fetchDefaultCollateral = async ({
	program,
	userPubKey,
	index,
}: {
	program: Incept
	userPubKey: PublicKey | null
	index: number
}) => {
	if (!userPubKey) return
	await program.loadManager()

	let [cometResult, healthScoreResult, usdiAccountResult] = await Promise.allSettled([
		program.getComet(),
		program.getHealthScore(),
		getUSDiAccount(program),
	])

	let balance = 0
	let collAmount = 0
	let prevHealthScore = 0

	if (usdiAccountResult.status === 'fulfilled' && usdiAccountResult.value !== undefined) {
		const tokenBalance = await program.connection.getTokenAccountBalance(usdiAccountResult.value!)
		balance = tokenBalance.value.uiAmount!
	}

	if (healthScoreResult.status === 'fulfilled') {
		prevHealthScore = healthScoreResult.value.healthScore
	}

	if (cometResult.status === 'fulfilled') {
		collAmount = toNumber(cometResult.value.collaterals[index].collateralAmount)
	}
	let collAmountDollarPrice = 1 // Since its USDi.
	let totalCollValue = collAmount * collAmountDollarPrice

	//const { tickerIcon, tickerName, tickerSymbol } = assetMapping(index)
	const tickerIcon = '/images/assets/USDi.png'
	const tickerSymbol = 'USDi'
	const tickerName = 'USDi'

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
	refetchOnMount?: QueryObserverOptions['refetchOnMount']
	enabled?: boolean
}

export function useEditCollateralQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
	const { getInceptApp } = useIncept()
	return useQuery(
		['editCollateral', userPubKey, index],
		() => fetchDefaultCollateral({ program: getInceptApp(), userPubKey, index }),
		{
			refetchOnMount,
			enabled,
		}
	)
}
