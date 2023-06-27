import { TokenData } from "incept-protocol-sdk/sdk/src/interfaces";
import { toNumber } from "incept-protocol-sdk/sdk/src/decimal";
import { DEVNET_TOKEN_SCALE } from "incept-protocol-sdk/sdk/src/clone"
import { calculatePoolAmounts } from "incept-protocol-sdk/sdk/src/utils";
import axios from "axios";

export type Interval = 'day' | 'hour';
export type Filter = 'day' | 'week' | 'month' | 'year';

export type ResponseValue = {
  time_interval: string;
  pool_index: number;
  total_committed_onusd_liquidity: number;
  volume: number;
  trading_fees: number;
};

export const generateDates = (start: Date, interval: Interval): Date[] => {
  let currentDate = new Date(start.getTime()); // Create a new date object to avoid mutating the original
  let dates = [new Date(currentDate)]; // Include the start date in the array
  let now = new Date(); // Get current timestamp

  while (currentDate < now) {
    if (interval === 'hour') {
      currentDate.setHours(currentDate.getHours() + 1);
    } else if (interval === 'day') {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Only add the date if it's before the current time
    if (currentDate < now) {
      dates.push(new Date(currentDate)); // Create a new date object to avoid references to the same object
    }
  }

  return dates;
}

export const fetchStatsData = async (filter: Filter, interval: Interval): Promise<ResponseValue[]> => {

  const baseUrl = process.env.NEXT_PUBLIC_CLONE_INDEX_ENDPOINT!
  let url = `${baseUrl}/stats?interval=${interval}&filter=${filter}`
  const authorization = process.env.NEXT_PUBLIC_CLONE_API_KEY!
  const headers = {
    'Authorization': authorization,
  }
  let response = await axios.get(url, { headers })

  return response.data?.body
}

export const getiAssetInfos = (tokenData: TokenData): { poolIndex: number, poolPrice: number, liquidity: number }[] => {
  const iassetInfo = [];
  for (let poolIndex = 0; poolIndex < Number(tokenData.numPools); poolIndex++) {
    let pool = tokenData.pools[poolIndex];
    let { poolOnusd, poolOnasset } = calculatePoolAmounts(
      toNumber(pool.onusdIld),
      toNumber(pool.onassetIld),
      toNumber(pool.committedOnusdLiquidity),
      toNumber(pool.assetInfo.price)
    )
    let poolPrice = poolOnusd / poolOnasset
    let liquidity = poolOnusd * 2;
    iassetInfo.push({ poolIndex, poolPrice, liquidity });
  }
  return iassetInfo;
}

type AggregatedStats = {
  volumeUSD: number,
  fees: number,
  previousVolumeUSD: number,
  previousFees: number,
  liquidityUSD: number,
  previousLiquidity: number
}

const convertToNumber = (val: string | number) => {
  return Number(val) * Math.pow(10, -DEVNET_TOKEN_SCALE)
}

export const getAggregatedPoolStats = async (tokenData: TokenData): Promise<AggregatedStats[]> => {

  let result: AggregatedStats[] = [];
  for (let i = 0; i < tokenData.numPools.toNumber(); i++) {
    result.push({ volumeUSD: 0, fees: 0, previousVolumeUSD: 0, previousFees: 0, liquidityUSD: toNumber(tokenData.pools[i].committedOnusdLiquidity) * 2, previousLiquidity: 0 })
  }

  const statsData = await fetchStatsData('week', 'hour')
  console.log(statsData)
  const now = (new Date()).getTime(); // Get current timestamp

  statsData.forEach((item) => {
    const dt = new Date(item.time_interval)
    const hoursDifference = (now - dt.getTime()) / 3600000
    const poolIndex = Number(item.pool_index)
    const tradingVolume = convertToNumber(item.volume)
    const tradingFees = convertToNumber(item.trading_fees)
    const liquidity = convertToNumber(item.total_committed_onusd_liquidity)
    if (hoursDifference <= 24) {
      result[poolIndex].volumeUSD += tradingVolume
      // result[poolIndex].liquidityUSD = liquidity
      result[poolIndex].fees += tradingFees
    } else if (hoursDifference <= 48 && hoursDifference > 24) {
      result[poolIndex].previousVolumeUSD += tradingVolume
      result[poolIndex].previousLiquidity = liquidity
      result[poolIndex].previousFees += tradingFees
    } else {
      result[poolIndex].liquidityUSD = liquidity
      result[poolIndex].previousLiquidity = liquidity
    }
  })
  return result
}

type OHLCVResponse = {
  time_interval: string,
  open: string,
  high: string,
  low: string,
  close: string,
  volume: string,
  trading_fees: string
}

const fetch30DayOHLCV = async (poolIndex: number, interval: 'hour' | 'day') => {
  const url = `${process.env.NEXT_PUBLIC_CLONE_INDEX_ENDPOINT}/ohlcv?interval=${interval}&pool=${poolIndex}&filter=month`
  const authorization = process.env.NEXT_PUBLIC_CLONE_API_KEY!

  let response = await axios.get(url, {
    data: { interval },
    headers: { 'Authorization': authorization }
  })

  let result: OHLCVResponse[] = response.data?.body
  return result
}

export const getDailyPoolPrices30Day = async (poolIndex: number) => {
  const requestResult = await fetch30DayOHLCV(poolIndex, 'hour')
  const now = new Date()
  const lookback30Day = new Date(now.getTime() - 30 * 86400 * 1000)

  const dates = generateDates(lookback30Day, 'hour')
  let prices = []

  let resultIndex = 0
  let datesIndex = 0;

  while (datesIndex < dates.length) {
    const result = requestResult[resultIndex]
    const date = dates[datesIndex]

    const resultDate = new Date(result.time_interval)

    const price = (() => {
      if (date < resultDate) {
        //Use open
        return Number(result.open)
      } else {
        resultIndex = Math.min(requestResult.length - 1, resultIndex + 1)
        return Number(result.close)
      }
    })()
    prices.push({ time: date.toUTCString(), value: price })
    datesIndex++
  }

  return prices
}

type BorrowInfo = {
  pool_index: number,
  time_interval: string,
  cumulative_collateral_delta: number,
  cumulative_borrowed_delta: number
}

type BorrowResult = { currentAmount: number, previousAmount: number, currentTVL: number, previousTVL: number }


export const fetchBorrowData = async (numPools: number): Promise<BorrowResult[]> => {
  const url = `${process.env.NEXT_PUBLIC_CLONE_INDEX_ENDPOINT}/borrow_stats?interval=hour&filter=month`
  const authorization = process.env.NEXT_PUBLIC_CLONE_API_KEY!

  let response = await axios.get(url, {
    headers: { 'Authorization': authorization }
  })

  let rawData: BorrowInfo[] = response.data?.body

  let result: BorrowResult[] = []
  for (let i = 0; i < numPools; i++) {
    result.push(
      parseBorrowData(rawData.filter((data) => Number(data.pool_index) === i))
    )
  }
  return result;
}

const parseBorrowData = (data: BorrowInfo[]): BorrowResult => {
  if (data.length === 0) {
    return { currentAmount: 0, previousAmount: 0, currentTVL: 0, previousTVL: 0 }
  }

  // Find latest entry
  let latestEntry = data.at(-1)!
  let latestEntryDate = new Date(latestEntry.time_interval)
  let now = new Date();
  let hoursElapsed = (now.getTime() - latestEntryDate.getTime()) / 3600000
  const conversionFactor = Math.pow(10, -8)
  const currentAmount = Number(latestEntry.cumulative_borrowed_delta) * conversionFactor
  const currentTVL = Number(latestEntry.cumulative_collateral_delta) * conversionFactor


  // If the entry was over 24 hours ago, zero rate increase/decrease
  if (hoursElapsed > 24 || data.length === 1) {
    return {
      currentAmount,
      previousAmount: currentAmount,
      currentTVL,
      previousTVL: currentTVL
    }
  }

  // Latest was less than 24 hours, find the next entry thats older than 24 hours.
  for (let i = 1; i < data.length; i++) {
    // Assume latest times are appended to the end of the list.
    const entry = data.at(data.length - i)!
    const entryDate = new Date(entry.time_interval)

    if ((now.getTime() - entryDate.getTime()) / 3600000 > 24) {
      const previousAmount = Number(entry.cumulative_borrowed_delta) * conversionFactor
      const previousTVL = Number(entry.cumulative_collateral_delta) * conversionFactor
      return {
        currentAmount,
        previousAmount,
        currentTVL,
        previousTVL
      }
    }
  }

  // Assume that we started from zero, thus +/- 100 percent increase.
  return {
    currentAmount,
    previousAmount: 0,
    currentTVL,
    previousTVL: 0
  }
}