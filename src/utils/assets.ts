import { Pools } from "clone-protocol-sdk/sdk/generated/clone";
import { CLONE_TOKEN_SCALE, CloneClient, fromCloneScale, fromScale } from "clone-protocol-sdk/sdk/src/clone"
import { PythHttpClient, getPythProgramKeyForCluster } from "@pythnetwork/client"
import { assetMapping } from "~/data/assets";
import { fetchBorrowStats, fetchStatsData, fetchOHLCV, BorrowStats, fetchPoolApy } from "./fetch_netlify";
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


export const getiAssetInfos = async (connection: Connection, program: CloneClient): Promise<{ poolIndex: number, poolPrice: number, liquidity: number, oraclePrice: number }[]> => {
  const pythClient = new PythHttpClient(connection, new PublicKey(getPythProgramKeyForCluster("devnet")));
  const data = await pythClient.getData();
  const pools = await program.getPools();
  const oracles = await program.getOracles();

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
    iassetInfo.push({ poolIndex, poolPrice, liquidity, oraclePrice });
  }
  return iassetInfo;
}

export type AggregatedStats = {
  volumeUSD: number,
  fees: number,
  previousVolumeUSD: number,
  previousFees: number,
  liquidityUSD: number,
  previousLiquidity: number,
  apy: number
}

const convertToNumber = (val: string | number) => {
  return Number(val) * Math.pow(10, -CLONE_TOKEN_SCALE)
}

export const getAggregatedPoolStats = async (pools: Pools): Promise<AggregatedStats[]> => {

  let result = pools.pools.map((pool) => {
    return { volumeUSD: 0, fees: 0, previousVolumeUSD: 0, previousFees: 0, 
      liquidityUSD: fromScale(pool.committedCollateralLiquidity, 7) * 2,
      previousLiquidity: 0, apy: 0
    }
  });

  const now = (new Date()).getTime(); // Get current timestamp
  const hoursDiff = (dt: Date) => {
    return (now - dt.getTime()) / 3600000
  }

  // Sorted by time_interval ascending
  const poolStatsData = await fetchStatsData("hour", "week", false)

  poolStatsData.forEach((item) => {

    const dt = new Date(item.time_interval)
    const poolIndex = Number(item.pool_index)
    const hoursDifference = hoursDiff(dt)
    const tradingFees = fromScale(item.trading_fees, 7)
    const liquidity = fromScale(item.total_committed_collateral_liquidity, 7) * 2
  
    if (hoursDifference <= 24) {
      result[poolIndex].fees += tradingFees
    } else if (hoursDifference > 24) {
      result[poolIndex].previousLiquidity = liquidity
      if (hoursDifference <= 48) {
        result[poolIndex].previousFees += tradingFees
      }
    }
  })

  const data = await fetchOHLCV("hour", "week");

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

  const apyData = await fetchPoolApy();

  apyData.forEach((item) => {
    result[Number(item.pool_index)].apy = item.apy_24hr
  })

  return result
}



export const getDailyPoolPrices30Day = async (poolIndex: number) => {
  const requestResult = await fetchOHLCV("hour", "month", poolIndex);
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

export const fetch24hourVolume = async () => {

  let data = await fetchOHLCV("hour", "month");

  let result: Map<number, number> = new Map()
  const now = new Date()
  const isWithin24hrs = (date: Date) => {
    return (date.getTime() >= (now.getTime() - 86400000))
  }
  const conversion = Math.pow(10, -CLONE_TOKEN_SCALE)
  data.forEach((response) => {
    if (!isWithin24hrs(new Date(response.time_interval))) {
      return;
    }
    const poolIndex = Number(response.pool_index)
    result.set(poolIndex, (result.get(poolIndex) ?? 0) + Number(response.volume) * conversion)
  })
  return result
}

type BorrowResult = { currentAmount: number, previousAmount: number, currentTVL: number, previousTVL: number }


export const fetchBorrowData = async (numPools: number): Promise<BorrowResult[]> => {
  const rawData = await fetchBorrowStats()
  let result: BorrowResult[] = []
  for (let i = 0; i < numPools; i++) {
    result.push(
      parseBorrowData(rawData.filter((data) => Number(data.pool_index) === i))
    )
  }
  return result;
}

const parseBorrowData = (data: BorrowStats[]): BorrowResult => {

  if (data.length === 0) {
    return { currentAmount: 0, previousAmount: 0, currentTVL: 0, previousTVL: 0 }
  } else if (data.length === 1) {
    const latestEntry = data[0]
    const currentAmount = fromCloneScale(latestEntry.cumulative_borrowed_delta)
    const currentTVL = fromScale(latestEntry.cumulative_collateral_delta, 7)
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
    const previousAmount = fromCloneScale(firstEntry.cumulative_borrowed_delta)
    const previousTVL = fromScale(firstEntry.cumulative_collateral_delta, 7)
    const latestEntry = data.at(-1)!
    const currentAmount = fromCloneScale(latestEntry.cumulative_borrowed_delta)
    const currentTVL = fromScale(latestEntry.cumulative_collateral_delta, 7)
    return { currentAmount, previousAmount, currentTVL, previousTVL }
  }
}