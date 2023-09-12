import { Oracles, Pools } from "clone-protocol-sdk/sdk/generated/clone";
import { CLONE_TOKEN_SCALE, CloneClient, fromCloneScale, fromScale } from "clone-protocol-sdk/sdk/src/clone"
import { PythHttpClient, getPythProgramKeyForCluster } from "@pythnetwork/client"
import { assetMapping } from "~/data/assets";
import { fetchFromCloneIndex } from "./fetch_netlify";
import { Connection, PublicKey } from "@solana/web3.js"

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
  const currentDate = new Date(start.getTime()); // Create a new date object to avoid mutating the original
  const dates = [new Date(currentDate)]; // Include the start date in the array
  const now = new Date(); // Get current timestamp

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
  const response = await fetchFromCloneIndex('stats', { interval, filter })
  return response.data as ResponseValue[]
}

export const getiAssetInfos = async (connection: Connection, program: CloneClient, pools: Pools, oracles: Oracles): Promise<{ poolIndex: number, poolPrice: number, liquidity: number }[]> => {
  const pythClient = new PythHttpClient(connection, new PublicKey(getPythProgramKeyForCluster("devnet")));
  const data = await pythClient.getData();

  const iassetInfo = [];
  for (let poolIndex = 0; poolIndex < Number(pools.pools.length); poolIndex++) {
    const pool = pools.pools[poolIndex];
    const oracle = oracles.oracles[Number(pool.assetInfo.oracleInfoIndex)];
    const committedCollateral = fromScale(pool.committedCollateralLiquidity, program.clone.collateral.scale)
    const poolCollateralIld = fromScale(pool.collateralIld, program.clone.collateral.scale)
    const poolOnassetIld = fromCloneScale(pool.onassetIld)
    const { pythSymbol } = assetMapping(poolIndex)
    const oraclePrice = data.productPrice.get(pythSymbol)?.aggregate.price ?? fromScale(oracle.price, oracle.expo);
    const poolPrice = (committedCollateral - poolCollateralIld) / (committedCollateral / oraclePrice - poolOnassetIld)
    const liquidity = committedCollateral * 2;
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
  return Number(val) * Math.pow(10, -CLONE_TOKEN_SCALE)
}

export const getAggregatedPoolStats = async (pools: Pools): Promise<AggregatedStats[]> => {
  let result: AggregatedStats[] = [];
  for (let i = 0; i < pools.pools.length; i++) {
    result.push({ volumeUSD: 0, fees: 0, previousVolumeUSD: 0, previousFees: 0, liquidityUSD: fromScale(pools.pools[i].committedCollateralLiquidity, 7) * 2, previousLiquidity: 0 })
  }

  const statsData = await fetchStatsData('week', 'hour')
  const now = (new Date()).getTime(); // Get current timestamp
  const hoursDiff = (dt: Date) => {
    return (now - dt.getTime()) / 3600000
  }

  statsData.forEach((item) => {
    const dt = new Date(item.time_interval)
    const hoursDifference = hoursDiff(dt)
    const poolIndex = Number(item.pool_index)
    const tradingFees = convertToNumber(item.trading_fees)
    const liquidity = convertToNumber(item.total_committed_onusd_liquidity)
    if (hoursDifference <= 24) {
      result[poolIndex].fees += tradingFees
    } else if (hoursDifference > 24) {
      result[poolIndex].previousLiquidity = liquidity

      if (hoursDifference <= 48)
        result[poolIndex].previousFees += tradingFees

    }
  })

  const response = await fetchFromCloneIndex('ohlcv', { interval: 'hour', filter: 'week' })
  const data: OHLCVResponse[] = response.data

  data.forEach((item) => {
    const dt = new Date(item.time_interval)
    const hoursDifference = hoursDiff(dt)
    const poolIndex = Number(item.pool_index)
    const tradingVolume = convertToNumber(item.volume)
    const tradingFees = convertToNumber(item.trading_fees)
    if (hoursDifference <= 24) {
      result[poolIndex].volumeUSD += tradingVolume
      result[poolIndex].fees += tradingFees
    } else if (hoursDifference <= 48 && hoursDifference > 24) {
      result[poolIndex].previousVolumeUSD += tradingVolume
      result[poolIndex].previousFees += tradingFees
    }
  })

  return result
}

type OHLCVResponse = {
  time_interval: string,
  pool_index: number,
  open: string,
  high: string,
  low: string,
  close: string,
  volume: string,
  trading_fees: string
}

const fetch30DayOHLCV = async (poolIndex: number, interval: 'hour' | 'day') => {
  const response = await fetchFromCloneIndex('ohlcv', { interval, pool: poolIndex, filter: 'month' })
  const result: OHLCVResponse[] = response.data
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
  const response = await fetchFromCloneIndex('borrow_stats', { interval: 'hour', filter: 'month' })
  const rawData: BorrowInfo[] = response.data

  let result: BorrowResult[] = []
  for (let i = 0; i < numPools; i++) {
    result.push(
      parseBorrowData(rawData.filter((data) => Number(data.pool_index) === i))
    )
  }
  return result;
}

const parseBorrowData = (data: BorrowInfo[]): BorrowResult => {
  const conversionFactor = Math.pow(10, -8)

  if (data.length === 0) {
    return { currentAmount: 0, previousAmount: 0, currentTVL: 0, previousTVL: 0 }
  } else if (data.length === 1) {
    const latestEntry = data[0]
    const currentAmount = Number(latestEntry.cumulative_borrowed_delta) * conversionFactor
    const currentTVL = Number(latestEntry.cumulative_collateral_delta) * conversionFactor
    const latestEntryDate = new Date(latestEntry.time_interval)
    const now = new Date();
    const hoursElapsed = (now.getTime() - latestEntryDate.getTime()) / 3600000
    if (hoursElapsed <= 24) {
      return { currentAmount, previousAmount: 0, currentTVL, previousTVL: 0 }
    } else {
      return { currentAmount, previousAmount: currentAmount, currentTVL, previousTVL: currentTVL }
    }
  } else {
    // Should only be two entries.
    const firstEntry = data[0]
    const previousAmount = Number(firstEntry.cumulative_borrowed_delta) * conversionFactor
    const previousTVL = Number(firstEntry.cumulative_collateral_delta) * conversionFactor
    const latestEntry = data.at(-1)!
    const currentAmount = Number(latestEntry.cumulative_borrowed_delta) * conversionFactor
    const currentTVL = Number(latestEntry.cumulative_collateral_delta) * conversionFactor
    return { currentAmount, previousAmount, currentTVL, previousTVL }
  }
}