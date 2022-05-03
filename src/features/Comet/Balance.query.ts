import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'

export const fetchBalance = async ({ program, userPubKey }: { program: Incept, userPubKey: PublicKey | null }) => {
	if (!userPubKey) return null

	await program.loadManager()

	let balanceVal = 0.0

	try {
		balanceVal = await program.getUsdiBalance()
	} catch {}

	return {
		balanceVal: balanceVal,
	}
}

interface GetProps {
	userPubKey: PublicKey | null
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
  enabled?: boolean
}

export interface Balance {
	balanceVal: number
}

export function useBalanceQuery({ userPubKey, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['cometBalance', userPubKey], () => fetchBalance({ program: getInceptApp(), userPubKey }), {
    refetchOnMount,
    enabled
  })
}