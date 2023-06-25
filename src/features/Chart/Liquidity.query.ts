import { Query, useQuery } from 'react-query'
import { FilterTime } from '~/components/Charts/TimeTabs'
import { DEVNET_TOKEN_SCALE } from 'incept-protocol-sdk/sdk/src/clone'
import { fetchStatsData, Interval, ResponseValue, generateDates, Filter } from 'src/utils/assets'

export interface ChartElem {
  time: string
  value: number
}

type TimeSeriesValue = { time: string, value: number }

const filterHistoricalData = (data: TimeSeriesValue[], numDays: number): TimeSeriesValue[] => {
  const today = new Date(); // get the current date
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
    return Number(val) * Math.pow(10, -DEVNET_TOKEN_SCALE)
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

  return result;
}

export const fetchTotalLiquidity = async ({ timeframe }: { timeframe: FilterTime }) => {

  const [daysLookback, filter, interval] = (() => {
    switch (timeframe) {
      case '1y':
        return [365, "year", 'day' as Interval]
      case '30d':
        return [30, "month", 'day' as Interval]
      case '7d':
        return [7, "week", 'hour' as Interval]
      case '24h':
        return [1, "week", 'hour' as Interval]
      default:
        throw new Error(`Unexpected timeframe: ${timeframe}`)
    }
  })()

  const rawData = await fetchStatsData(filter as Filter, interval)
  const aggregatedData = aggregatePoolData(rawData, interval)
  let chartData = aggregatedData.map(data => { return { time: data.datetime, value: data.total_liquidity } })
  chartData = filterHistoricalData(chartData, daysLookback)

  const allValues = chartData.map(elem => elem.value!)
  const maxValue = Math.floor(Math.max(...allValues))
  const minValue = Math.floor(Math.min(...allValues))

  return {
    chartData,
    maxValue,
    minValue
  }
}

export const fetchTotalUsers = async ({ timeframe }: { timeframe: FilterTime }) => {
  const chartData = [
    {
      time: '2022-03-01',
      value: 35
    },
    {
      time: '2022-03-02',
      value: 55
    },
    {
      time: '2022-03-03',
      value: 90
    },
    {
      time: '2022-03-04',
      value: 185
    },
    {
      time: '2022-03-05',
      value: 235
    },
  ]
  return { chartData }
}

export const fetchTotalVolume = async ({ timeframe }: { timeframe: FilterTime }) => {
  const [daysLookback, filter, interval] = (() => {
    switch (timeframe) {
      case '1y':
        return [365, "year", 'day' as Interval]
      case '30d':
        return [30, "month", 'day' as Interval]
      case '7d':
        return [7, "week", 'hour' as Interval]
      case '24h':
        return [1, "week", 'hour' as Interval]
      default:
        throw new Error(`Unexpected timeframe: ${timeframe}`)
    }
  })()

  const rawData = await fetchStatsData(filter as Filter, interval)
  const aggregatedData = aggregatePoolData(rawData, interval)
  const chartData = aggregatedData.map(data => { return { time: data.datetime, value: data.trading_volume } })
  const sumAllValue = chartData.reduce((a, b) => a + b.value, 0)

  return {
    chartData: filterHistoricalData(chartData, daysLookback),
    sumAllValue
  }
}

export const fetchTotalLiquidation = async ({ timeframe }: { timeframe: FilterTime }) => {
  // @TODO: When we setup the liquidation bot.
  const chartData = [
    {
      time: '2022-03-01',
      value: 65
    },
    {
      time: '2022-03-02',
      value: 45
    },
    {
      time: '2022-03-03',
      value: 180
    },
    {
      time: '2022-03-04',
      value: 65
    },
    {
      time: '2022-03-05',
      value: 95
    },
  ]

  return {
    chartData,
  }
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