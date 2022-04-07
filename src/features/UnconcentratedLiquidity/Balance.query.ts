import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { toScaledNumber } from 'sdk/src/utils'
import { useIncept } from '~/hooks/useIncept'

export const fetchMax = async ({ program, userPubKey, index }: { program: Incept, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return null

	await program.loadManager()

	let liquidityPosition = await program.getLiquidityPosition(index)
	let liquidityTokenBalance = toScaledNumber(liquidityPosition.liquidityTokenValue)

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
  return useQuery(['unconcentBalance', userPubKey, index], () => fetchMax({ program: getInceptApp(), userPubKey, index }), {
    refetchOnMount,
    enabled
  })
}