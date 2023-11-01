import { Query, useQuery } from '@tanstack/react-query'
import { FilterTime } from '~/components/Charts/TimeTabs'
import { CLONE_TOKEN_SCALE } from 'clone-protocol-sdk/sdk/src/clone'
import { fetchStatsData, Interval, ResponseValue, generateDates, Filter } from 'src/utils/assets'

export interface ChartElem {
  time: string
  value: number
}

type TimeSeriesValue = { time: string, value: number }

const filterHistoricalData = (data: TimeSeriesValue[], numDays: number): TimeSeriesValue[] => {
  const today = new Date();
  const numMilliseconds = numDays * 86400 * 1000; // calculate the number of milliseconds in the specified number of days
  const historicalDate = new Date(today.getTime() - numMilliseconds); // calculate the historical date

  const filteredData = data.filter(({ time }) => {
    const currentDatetime = new Date(time);
    return currentDatetime >= historicalDate; // include values within the historical range
  });

  return filteredData;
};


type AggregatedData = {
  datetime: string;
  total_liquidity: number;
  trading_volume: number;
  trading_fees: number;
}

const aggregatePoolData = (poolDataArray: ResponseValue[], interval: Interval): AggregatedData[] => {
  const groupedByDtAndPool: Record<string, Record<string, ResponseValue>> = {};

  const setDatetime = (dt: Date) => {
    if (interval === 'hour') {
      dt.setMinutes(0, 0, 0);
    } else {
      dt.setHours(0, 0, 0, 0);
    }
  }
  const getDTKeys = (dt: Date) => {
    setDatetime(dt)
    return dt.toISOString();
  }
  const convertToNumber = (val: string | number) => {
    return Number(val) * Math.pow(10, -CLONE_TOKEN_SCALE)
  }

  const poolIndices: Set<number> = new Set()
  poolDataArray.forEach(d => poolIndices.add(d.pool_index))

  for (const data of poolDataArray) {
    poolIndices.add(data.pool_index)
    const dt = new Date(data.time_interval)
    const datetimeKey = getDTKeys(dt)
    if (!groupedByDtAndPool[datetimeKey]) {
      groupedByDtAndPool[datetimeKey] = {}
    }
    groupedByDtAndPool[datetimeKey][data.pool_index] = data
  }

  const recentLiquidityByPool: Record<string, number> = {}
  poolIndices.forEach((index) => {
    recentLiquidityByPool[index] = 0
  })

  // Create the first entry of the result
  let result: AggregatedData[] = []

  if (poolDataArray.length > 0) {
    let startingDate = new Date(poolDataArray.at(0)!.time_interval);
    setDatetime(startingDate)
    const dates = generateDates(startingDate, interval)

    for (let i = 0; i < dates.length; i++) {

      const currentDate = getDTKeys(dates[i])
      let record: AggregatedData = {
        datetime: currentDate, total_liquidity: 0, trading_volume: 0, trading_fees: 0
      }

      const currentGBData = groupedByDtAndPool[currentDate]
      if (!currentGBData) {
        poolIndices.forEach((index) => {
          record.total_liquidity += recentLiquidityByPool[index]
        })
      } else {
        poolIndices.forEach((index) => {
          let data = currentGBData[index]
          if (data) {
            record.total_liquidity += convertToNumber(data.total_committed_onusd_liquidity)
            record.trading_volume += convertToNumber(data.volume)
            record.trading_fees += convertToNumber(data.trading_fees)
            recentLiquidityByPool[index] = convertToNumber(data.total_committed_onusd_liquidity)
          } else {
            record.total_liquidity += recentLiquidityByPool[index]
          }
        })
      }
      result.push(record)
    }
  }

  return result;
}

export const fetchTotalLiquidity = async ({ timeframe }: { timeframe: FilterTime }) => {
  return await fetchTotalValues(timeframe,
    (data: AggregatedData) => {
      return { time: data.datetime, value: data.total_liquidity }
    }
  )
}

export const fetchTotalVolume = async ({ timeframe }: { timeframe: FilterTime }) => {
  return await fetchTotalValues(timeframe,
    (data: AggregatedData) => {
      return { time: data.datetime, value: data.trading_volume }
    }
  )
}

export const fetchTotalValues = async (timeframe: FilterTime, mapFunction: (tsVal: AggregatedData) => TimeSeriesValue) => {
  const [daysLookback, filter, interval, intervalMs] = (() => {
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
  })()

  const rawData = await fetchStatsData(filter as Filter, interval)
  const aggregatedData = aggregatePoolData(rawData, interval)
  const tsData: TimeSeriesValue[] = aggregatedData.map(mapFunction)
  console.log('t', tsData)

  const now = new Date()
  const currentIntervalDt = new Date(now.getTime() - now.getTime() % intervalMs)
  const startDate = new Date(currentIntervalDt.getTime() - daysLookback * 86400000)
  const endDate = tsData.length > 0 ? new Date(tsData[0].time) : currentIntervalDt

  let chartData: TimeSeriesValue[] = [];
  if (startDate < endDate) {
    chartData = backfillWithZeroValue(startDate, endDate, intervalMs)
    chartData.push(...tsData)
  } else {
    chartData = tsData;
  }

  chartData = filterHistoricalData(chartData, daysLookback)
  const shiftByInterval = (item: TimeSeriesValue) => {
    const dt = new Date(item.time)
    return { time: new Date(dt.getTime() + intervalMs).toISOString(), value: item.value }
  }
  chartData = chartData.map(shiftByInterval).filter((item) => {
    return (new Date(item.time)) < currentIntervalDt
  })

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