import { Query, useQuery } from 'react-query'
import { Incept } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'

export const fetchPoolAnalytics = async ({ tickerSymbol, program, setStartTimer }: { tickerSymbol: string, program: Incept, setStartTimer: (start: boolean) => void }) => {
  console.log('fetchPoolAnalytics')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

  await program.loadManager()

  //@TODO : fetch proper data for this
  const result = {
    totalLiquidity: 15430459.49,
    tvl: 15430459.49,
    tradingVol24h: 15430459.49,
    feeRevenue24h: 15430459.49,
  }

  return result
}

interface GetAssetsProps {
  tickerSymbol: string
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export interface AnalyticsInfo {
  totalLiquidity: number
  tvl: number
  tradingVol24h: number
  feeRevenue24h: number
}

export function usePoolAnalyticsQuery({ tickerSymbol, refetchOnMount, enabled = true }: GetAssetsProps) {
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  return useQuery(['poolAnalytics'], () => fetchPoolAnalytics({ tickerSymbol, program: getInceptApp(), setStartTimer }), {
    refetchOnMount,
    refetchInterval: REFETCH_CYCLE,
    refetchIntervalInBackground: true,
    enabled
  })
}
