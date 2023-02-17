import { Query, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'

export const fetchMax = async ({ program, userPubKey, index, setStartTimer }: { program: InceptClient, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
	if (!userPubKey) return null

  console.log('fetchBalance')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

	await program.loadManager()

	const tokenData = await program.getTokenData();
	let liquidityPositions = await program.getLiquidityPositions();

	let liquidityPosition = liquidityPositions[index];
	let liquidityTokenBalance = liquidityPosition.liquidityTokens

	let pool = tokenData.pools[liquidityPosition.poolIndex]

	let liquidityTokenSupplyBeforeComet = (
		await program.connection.getTokenSupply(pool.liquidityTokenMint, "processed")
	).value!.uiAmount

	let maxVal = ((toNumber(pool.usdiAmount) * liquidityTokenBalance) / liquidityTokenSupplyBeforeComet!)

	return {
		maxVal: maxVal,
	}
}

interface GetProps {
	userPubKey: PublicKey | null
	index: number
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export function useBalanceQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  return useQuery(['unconcentBalance', userPubKey, index], () => fetchMax({ program: getInceptApp(), userPubKey, index, setStartTimer }), {
    refetchOnMount,
    refetchInterval: REFETCH_CYCLE,
    refetchIntervalInBackground: true,
    enabled
  })
}