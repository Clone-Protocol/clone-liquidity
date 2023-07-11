import { Query, useQuery } from 'react-query'
import { CloneClient } from "incept-protocol-sdk/sdk/src/clone"
import { useClone } from '~/hooks/useClone'
import { assetMapping } from '~/data/assets'
import { useDataLoading } from '~/hooks/useDataLoading'
import { REFETCH_CYCLE } from '~/components/Common/DataLoadingIndicator'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { getAggregatedPoolStats, fetchBorrowData } from '~/utils/assets'

export const fetchPoolAnalytics = async ({ tickerSymbol, program, setStartTimer }: { tickerSymbol: string, program: CloneClient, setStartTimer: (start: boolean) => void }) => {
  console.log('fetchPoolAnalytics')
  // start timer in data-loading-indicator
  setStartTimer(false);
  setStartTimer(true);

  await program.loadClone();
  const tokenData = await program.getTokenData();
  const poolStats = await getAggregatedPoolStats(tokenData);
  const calcPctGain = (current: number, prev: number) => {
    return 100 * (current - prev) / prev
  }

  const borrowData = await fetchBorrowData(Number(tokenData.numPools))

  for (let poolIndex = 0; poolIndex < tokenData.numPools.toNumber(); poolIndex++) {
    const info = assetMapping(poolIndex)
    if (tickerSymbol === info.tickerSymbol) {
      const stats = poolStats[poolIndex]
      const borrowedStats = borrowData[poolIndex]

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
        currentAmountBorrowed: borrowedStats.currentAmount,
        currentTVL: borrowedStats.currentTVL,
        amountBorrowedRate: calcPctGain(borrowedStats.currentAmount, borrowedStats.previousAmount),
        tvlRate: calcPctGain(borrowedStats.currentTVL, borrowedStats.previousTVL)
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
  const { getCloneApp } = useClone()
  const { setStartTimer } = useDataLoading()

  if (wallet) {
    return useQuery(['poolAnalytics', tickerSymbol], () => fetchPoolAnalytics({ tickerSymbol, program: getCloneApp(wallet), setStartTimer }), {
      refetchOnMount,
      refetchInterval: REFETCH_CYCLE,
      refetchIntervalInBackground: true,
      enabled
    })
  } else {
    return useQuery(['poolAnalytics'], () => { })
  }
}
