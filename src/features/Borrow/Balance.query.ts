import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'

export const fetchBalance = async ({ program, userPubKey, index }: { program: Incept, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return null

	await program.loadManager()

	let usdiVal = 0.0
	let iassetVal = 0.0

	try {
		usdiVal = await program.getUsdiBalance()
	} catch {}

	try {
		iassetVal = await program.getiAssetBalance(index)
	} catch {}

	return {
		usdiVal: usdiVal,
		iassetVal: iassetVal,
	}
}

interface GetProps {
  userPubKey: PublicKey | null
  index: number
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
  enabled?: boolean
}

export interface Balance {
	usdiVal: number
	iassetVal: number
}

export function useBalanceQuery({ userPubKey, index, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
  return useQuery(['borrowBalance', userPubKey, index], () => fetchBalance({ program: getInceptApp(), userPubKey, index }), {
    refetchOnMount,
    enabled
  })
}