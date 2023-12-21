import { Query, useQuery } from '@tanstack/react-query'
import { FilterTime } from '~/components/Charts/TimeTabs'
import { Interval } from 'src/utils/assets'
import { fetchStatsData, fetchTotalLiquidity as netlifyFetchTotalLiquidity } from 'src/utils/fetch_netlify'
import { Connection, PublicKey } from '@solana/web3.js'
import { Pools } from 'clone-protocol-sdk/sdk/generated/clone'

export interface ChartElem {
  time: string
  value: number
}

type TimeSeriesValue = { time: string, value: number }

const getTimeFrames = (timeframe: FilterTime): [number, string, string, number] => {
  switch (timeframe) {
    case '1y':
      return [365, "year", 'day' as Interval, 86400000]
    case '30d':
      return [30, "month", 'day' as Interval, 86400000]
    case '7d':
      return [7, "week", 'hour' as Interval, 3600000]
    case '24h':
      return [1, "day", 'hour' as Interval, 3600000]
    default:
      throw new Error(`Unexpected timeframe: ${timeframe}`)
  }
}

export const fetchTotalLiquidity = async ({ timeframe }: { timeframe: FilterTime }) => {

  const [_, filter, interval, intervalMs] = getTimeFrames(timeframe)
  const aggregatedData = await netlifyFetchTotalLiquidity(interval, filter)
  const dataMap = new Map<number, number>()
  aggregatedData.forEach((item) => {
    dataMap.set((new Date(item.time_interval)).getTime(), 2 * item.total_liquidity * Math.pow(10, -7))
  })

  const now = new Date()
  const currentIntervalDt = new Date(now.getTime() - now.getTime() % intervalMs)
  const startDate = new Date(aggregatedData[0].time_interval)

  let chartData = backfillWithZeroValue(startDate, currentIntervalDt, intervalMs)
  let currentValue = 0;
  for (const item of chartData) {
    const value = dataMap.get((new Date(item.time)).getTime())
    if (value) {
      currentValue = value
    }
    item.value = currentValue
  }
  // Fetch latest record
  const connection = new Connection(process.env.NEXT_PUBLIC_NETWORK_ENDPOINT!, 'confirmed')
  const poolAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("pools")], new PublicKey(process.env.NEXT_PUBLIC_CLONE_PROGRAM_ID!)
  )[0]
  const pools = await Pools.fromAccountAddress(connection, poolAddress)
  let latestLiquidity = 0;
  pools.pools.forEach((pool) => {
    latestLiquidity += pool.committedCollateralLiquidity * Math.pow(10, -7) * 2
  });
  chartData.push({ time: now.toISOString(), value: latestLiquidity })

  const sumAllValue = chartData.reduce((a, b) => a + b.value, 0)
  const allValues = chartData.map(elem => elem.value!)
  const maxValue = Math.floor(Math.max(...allValues))
  const minValue = Math.floor(Math.min(...allValues))

  return {
    chartData,
    maxValue,
    minValue,
    sumAllValue
  }

}

export const fetchTotalVolume = async ({ timeframe }: { timeframe: FilterTime }) => {
  const [daysLookback, filter, interval, intervalMs] = getTimeFrames(timeframe)
  const aggregatedData = await fetchStatsData(interval, filter, true)
  const dataMap = new Map<number, number>()
  aggregatedData.forEach((item) => {
    dataMap.set((new Date(item.time_interval)).getTime(), item.volume * Math.pow(10, -7))
  })

  const now = new Date()
  const currentIntervalDt = new Date(now.getTime() - now.getTime() % intervalMs)
  const startDate = new Date(currentIntervalDt.getTime() - daysLookback * 86400000)

  let chartData = backfillWithZeroValue(startDate, currentIntervalDt, intervalMs)
  for (const item of chartData) {
    const value = dataMap.get((new Date(item.time)).getTime())
    if (value) {
      item.value = value
    }
  }

  const sumAllValue = chartData.reduce((a, b) => a + b.value, 0)
  const allValues = chartData.map(elem => elem.value!)
  const maxValue = Math.floor(Math.max(...allValues))
  const minValue = Math.floor(Math.min(...allValues))

  return {
    chartData,
    maxValue,
    minValue,
    sumAllValue
  }
}

const backfillWithZeroValue = (start: Date, end: Date, intervalMs: number): TimeSeriesValue[] => {
  const value = 0
  let result = [
    { time: start.toISOString(), value }
  ]
  let currentDate = start;
  while (currentDate.getTime() < end.getTime()) {
    currentDate = new Date(currentDate.getTime() + intervalMs)
    result.push({ time: currentDate.toISOString(), value })
  }

  return result;
}

interface GetProps {
  timeframe: FilterTime
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export function useTotalLiquidityQuery({ timeframe, refetchOnMount, enabled = true }: GetProps) {
  return useQuery(['totalLiquidity', timeframe], () => fetchTotalLiquidity({ timeframe }), {
    refetchOnMount,
    enabled
  })
}

export function useTotalVolumeQuery({ timeframe, refetchOnMount, enabled = true }: GetProps) {
  return useQuery(['totalVolume', timeframe], () => fetchTotalVolume({ timeframe }), {
    refetchOnMount,
    enabled
  })
}