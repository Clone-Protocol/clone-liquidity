import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { assetMapping } from 'src/data/assets'
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'

export const fetchDefaultCollateral = async ({ program, userPubKey, index }: { program: Incept, userPubKey: PublicKey | null, index: number }) => {
	if (!userPubKey) return

  let balance = 0
  let prevHealthScore = 0
  let collAmount = 0
  let collAmountDollarPrice = 0
  let totalCollValue = 33000.04

  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(index)
  
	return {
		tickerIcon,
		tickerName,
		tickerSymbol,
    balance,
		prevHealthScore,
    collAmount,
    collAmountDollarPrice,
    totalCollValue
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
  return useQuery(['editCollateral', userPubKey, index], () => fetchDefaultCollateral({ program: getInceptApp(), userPubKey, index }), {
    refetchOnMount,
    enabled
  })
}