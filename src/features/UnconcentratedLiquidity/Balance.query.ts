import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'

export const fetchMax = async ({ program, userPubKey, index, setStartTimer }: { program: Incept, userPubKey: PublicKey | null, index: number, setStartTimer: (start: boolean) => void }) => {
	if (!userPubKey) return null

  console.log('fetchBalance')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

	await program.loadManager()

	let liquidityPosition = await program.getLiquidityPosition(index)
	let liquidityTokenBalance = toNumber(liquidityPosition.liquidityTokenValue)

	let pool = await program.getPool(liquidityPosition.poolIndex)

	let liquidityTokenSupplyBeforeComet = (
		await program.connection.getTokenSupply(pool.liquidityTokenMint, 'confirmed')
	).value!.uiAmount

	let balances = await program.getPoolBalances(liquidityPosition.poolIndex)

	let maxVal = ((balances[1] * liquidityTokenBalance) / liquidityTokenSupplyBeforeComet!) * 2

	return {
		maxVal: maxVal,
	}
}

interface GetProps {
	userPubKey: PublicKey | null
	index: number
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
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