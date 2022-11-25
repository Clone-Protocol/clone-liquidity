import { QueryObserverOptions, useQuery } from 'react-query'
import { PublicKey } from '@solana/web3.js'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'

export const fetchCollaterals = async ({ program, userPubKey, setStartTimer }: { program: Incept, userPubKey: PublicKey | null, setStartTimer: (start: boolean) => void}) => {
	if (!userPubKey) return []

	console.log('fetchPools :: Collaterals.query')
	// start timer in data-loading-indicator
	setStartTimer(false);
	setStartTimer(true);

	const result: CollateralList[] = [
    {
      id: 0,
      tickerSymbol: 'iEUR',
			tickerIcon: '/images/assets/euro.png',
      balance: 20.355,
      isEnabled: false,
    },
    {
      id: 1,
      tickerSymbol: 'iEUR',
			tickerIcon: '/images/assets/euro.png',
      balance: 20.355,
      isEnabled: true,
    },
    {
      id: 2,
      tickerSymbol: 'iEUR',
			tickerIcon: '/images/assets/euro.png',
      balance: 20.355,
      isEnabled: true,
    },
  ]
	return result
}

interface GetProps {
	userPubKey: PublicKey | null
  refetchOnMount?: QueryObserverOptions['refetchOnMount']
  enabled?: boolean
}

export interface CollateralList {
	id: number
	tickerSymbol: string
	tickerIcon: string
  balance: number
  isEnabled: boolean
}

export function useCollateralsQuery({ userPubKey, refetchOnMount, enabled = true }: GetProps) {
  const { getInceptApp } = useIncept()
	const { setStartTimer } = useDataLoading()

  return useQuery(['collaterals', userPubKey], () => fetchCollaterals({ program: getInceptApp(), userPubKey, setStartTimer }), {
    refetchOnMount,
		refetchInterval: REFETCH_CYCLE,
		refetchIntervalInBackground: true,
    enabled,
  })
}