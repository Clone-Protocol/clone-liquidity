import { Query, useQuery } from 'react-query'
import { FilterTime } from '~/components/Charts/TimeTabs'
import { getGoogleSheetsDoc } from "~/utils/google_sheets"
import moment from 'moment'
import { DEVNET_TOKEN_SCALE } from 'incept-protocol-sdk/sdk/src/incept'

export interface ChartElem {
  time: string
  value: number
}

type TimeSeriesValue = { time: string, value: number }
const MAX_ITERATIONS = 100000;

const getMomentFromTimeframe = (timeframe: FilterTime) => {
  let daysLookback = (() => {
    switch (timeframe) {
      case '1y':
        return 365
      case '30d':
        return 30
      case '7d':
        return 7
      case '24h':
        return 1
      default:
        throw new Error(`Unexpected timeframe: ${timeframe}`)
    }
  })()
  return moment().utc(
  ).subtract(daysLookback, 'days')
}

const fillInTimeGaps = (arr: { time: number, value: number }[], endTimestamp: number): TimeSeriesValue[] => {

  let chartData: TimeSeriesValue[] = []

  if (arr.length === 0)
    return [{ time: moment(endTimestamp * 1e3).utc().format(), value: 0 }]

  let index = 0
  let startingTime = arr[0].time
  let currentValue = arr[0].value

  let N = Math.floor((endTimestamp - startingTime) / 3600)

  for (let i = 0; i < N; i++) {
    let currentTime = startingTime + 3600 * i
    let { time, value } = arr[index]
    if (currentTime >= time) {
      currentValue = value
      index = Math.min(index + 1, arr.length - 1)
    }
    chartData.push({ time: moment(currentTime * 1e3).utc().format(), value: currentValue })
  }

  return chartData

}

export const fetchTotalLiquidity = async ({ timeframe }: { timeframe: FilterTime }) => {
  let temp = [];
  const doc = await getGoogleSheetsDoc()

  const sheet = await doc.sheetsByTitle["HourlyLiquidityDelta"]
  await sheet.loadCells();

  const startingTimestamp = getMomentFromTimeframe(timeframe).unix()

  for (let row = 2; row < MAX_ITERATIONS; row++) {
    let blockTime = sheet.getCell(row, 0).formattedValue
    const usdiDelta = sheet.getCell(row, 2).formattedValue
    if (blockTime === null || usdiDelta === null)
      break;
    blockTime = Number(blockTime)

    if (blockTime >= startingTimestamp)
      temp.push({ time: blockTime, value: usdiDelta * Math.pow(10, -DEVNET_TOKEN_SCALE) })
  }

  let chartData = fillInTimeGaps(temp, moment().utc().unix())

  if (chartData.length < 2) {
    chartData.push({ time: moment(new Date()).utc().format(), value: 0 })
  }

  return {
    chartData
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

  // @TODO Fix later
  // let temp = [];

  // const doc = await getGoogleSheetsDoc()

  // const sheet = await doc.sheetsByTitle["HourlyUserCount"]
  // await sheet.loadCells();

  // const startingTimestamp = getMomentFromTimeframe(timeframe).unix()

  // for (let row = 1; row < MAX_ITERATIONS; row++) {
  //   let blockTime = sheet.getCell(row, 0).formattedValue
  //   const cumulativeUsers = sheet.getCell(row, 2).formattedValue
  //   console.log(blockTime, cumulativeUsers)
  //   if (blockTime === null || cumulativeUsers === null) 
  //     break;
  //   blockTime = Number(blockTime)

  //   if (blockTime >= startingTimestamp)
  //     temp.push({time: blockTime, value: Number(cumulativeUsers)})
  // }

  // return {
  //   chartData: fillInTimeGaps(temp, moment().utc().unix())
  // }
}

export const fetchTotalVolume = async ({ timeframe }: { timeframe: FilterTime }) => {
  let temp = []
  const doc = await getGoogleSheetsDoc()

  const sheet = await doc.sheetsByTitle["HourlyTradingVolume"]
  await sheet.loadCells();

  const startingTimestamp = getMomentFromTimeframe(timeframe).unix()

  for (let row = 2; row < MAX_ITERATIONS; row++) {
    let blockTime = sheet.getCell(row, 0).formattedValue
    const usdiDelta = sheet.getCell(row, 2).formattedValue
    if (blockTime === null || usdiDelta === null)
      break;

    blockTime = Number(blockTime)

    if (blockTime >= startingTimestamp)
      temp.push({ time: blockTime, value: usdiDelta * Math.pow(10, -DEVNET_TOKEN_SCALE) })
  }

  let chartData = fillInTimeGaps(temp, moment().utc().unix())

  if (chartData.length < 2) {
    chartData.push({ time: moment(new Date()).utc().format(), value: 0 })
  }

  return {
    chartData
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