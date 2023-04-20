import { Query, useQuery } from 'react-query'
import { InceptClient } from "incept-protocol-sdk/sdk/src/incept"
import { useIncept } from '~/hooks/useIncept'
import { assetMapping } from '~/data/assets'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { getAggregatedPoolStats } from '~/utils/assets'

export const fetchPoolAnalytics = async ({ tickerSymbol, program, setStartTimer }: { tickerSymbol: string, program: InceptClient, setStartTimer: (start: boolean) => void }) => {
  console.log('fetchPoolAnalytics')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

  await program.loadManager();
  const tokenData = await program.getTokenData();
  const poolStats = await getAggregatedPoolStats(tokenData);
  const calcPctGain = (current: number, prev: number) => {
    return 100 * (current - prev) / prev
  }

  console.log("STATS:", poolStats)

  for (let poolIndex = 0; poolIndex < tokenData.numPools.toNumber(); poolIndex++) {
    const info = assetMapping(poolIndex)
    if (tickerSymbol === info.tickerSymbol) {
      const stats = poolStats[poolIndex]

      return {
        totalLiquidity: stats.liquidityUSD,
        liquidityGain: stats.liquidityUSD - stats.previousLiquidity,
        liquidityGainPct: calcPctGain(stats.liquidityUSD, stats.previousLiquidity),
        tradingVol24h: stats.volumeUSD,
        tradingVolGain: stats.volumeUSD - stats.previousVolumeUSD,
        tradingVolGainPct: calcPctGain(stats.volumeUSD, stats.previousVolumeUSD),
        feeRevenue24hr: stats.fees,
        feeRevenueGain: stats.fees - stats.previousFees,
        feeRevenueGainPct: calcPctGain(stats.fees, stats.previousFees),
      }
    }
  }
  throw Error(`Invalid ticker symbol: ${tickerSymbol}!`)
}

interface GetAssetsProps {
  tickerSymbol: string
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export interface AnalyticsInfo {
  totalLiquidity: number
  tradingVol24h: number
  feeRevenue24h: number
}

export function usePoolAnalyticsQuery({ tickerSymbol, refetchOnMount, enabled = true }: GetAssetsProps) {
  const wallet = useAnchorWallet()
  const { getInceptApp } = useIncept()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['poolAnalytics', tickerSymbol], () => fetchPoolAnalytics({ tickerSymbol, program: getInceptApp(wallet), setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['poolAnalytics'], () => { })
  }
}
