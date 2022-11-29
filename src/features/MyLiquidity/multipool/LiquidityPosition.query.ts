import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'incept-protocol-sdk/sdk/src/incept'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'

export const fetchLiquidityDetail = async ({
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

	const tokenData = await program.getTokenData()
	const pool = tokenData.pools[index]

	let price = toNumber(pool.usdiAmount) / toNumber(pool.iassetAmount)

	const { tickerIcon, tickerName, tickerSymbol } = assetMapping(index)
	return {
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		price,
	}
}

interface GetProps {
	userPubKey: PublicKey | null
	index: number
	refetchOnMount?: QueryObserverOptions['refetchOnMount']
	enabled?: boolean
}

export function useLiquidityDetailQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
	const { getInceptApp } = useIncept()
	return useQuery(
		['liquidityPosition', userPubKey, index],
		() => fetchLiquidityDetail({ program: getInceptApp(), userPubKey, index }),
		{
			refetchOnMount,
			enabled,
		}
	)
}
