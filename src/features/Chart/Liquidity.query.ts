import { Query, useQuery } from '@tanstack/react-query'
import { FilterTime } from '~/components/Charts/TimeTabs'
import { Interval } from 'src/utils/assets'
import { fetchStatsData } from 'src/utils/fetch_netlify'

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
        return [1, "week", 'hour' as Interval, 3600000]
      default:
        throw new Error(`Unexpected timeframe: ${timeframe}`)
    }
}

export const fetchTotalLiquidity = async ({ timeframe }: { timeframe: FilterTime }) => {
  const [daysLookback, interval, filter, intervalMs] = getTimeFrames(timeframe)
  const aggregatedData = await fetchStatsData(filter, interval, true)
  const dataMap = new Map<Date, number>()
  aggregatedData.forEach((item) => {
    dataMap.set(new Date(item.time_interval), item.total_committed_collateral_liquidity)
  })

  const now = new Date()
  const currentIntervalDt = new Date(now.getTime() - now.getTime() % intervalMs)
  const startDate = new Date(currentIntervalDt.getTime() - daysLookback * 86400000)

  let chartData = backfillWithZeroValue(startDate, currentIntervalDt, intervalMs)
  let currentValue = 0;

  for (const item of chartData) {
    const value = dataMap.get(new Date(item.time))
    if (value) {
      currentValue = value
    }
    item.value = currentValue
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

export const fetchTotalVolume = async ({ timeframe }: { timeframe: FilterTime }) => {
  const [daysLookback, interval, filter, intervalMs] = getTimeFrames(timeframe)
  const aggregatedData = await fetchStatsData(filter, interval, true)
  const dataMap = new Map<Date, number>()
  aggregatedData.forEach((item) => {
    dataMap.set(new Date(item.time_interval), item.volume)
  })

  const now = new Date()
  const currentIntervalDt = new Date(now.getTime() - now.getTime() % intervalMs)
  const startDate = new Date(currentIntervalDt.getTime() - daysLookback * 86400000)

  let chartData = backfillWithZeroValue(startDate, currentIntervalDt, intervalMs)
  for (const item of chartData) {
    const value = dataMap.get(new Date(item.time))
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