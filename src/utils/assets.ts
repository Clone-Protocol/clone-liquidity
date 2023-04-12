import { TokenData } from "incept-protocol-sdk/sdk/src/interfaces";
import { toNumber } from "incept-protocol-sdk/sdk/src/decimal";
import { getGoogleSheetsDoc } from "~/utils/google_sheets"

export const getiAssetInfos = (tokenData: TokenData): {poolIndex: number, poolPrice: number, liquidity: number}[] => {
    const iassetInfo = [];
    for (let poolIndex = 0; poolIndex < Number(tokenData.numPools); poolIndex++) {
      let pool = tokenData.pools[poolIndex];
      let poolBalances = [toNumber(pool.iassetAmount), toNumber(pool.usdiAmount)];
      let poolPrice = poolBalances[1] / poolBalances[0];
      let liquidity = poolBalances[1] * 2;
      iassetInfo.push({poolIndex, poolPrice, liquidity});
    }
    return iassetInfo;
  }

export const getAggregatedPoolStats = async (tokenData: TokenData): Promise<{volumeUSD: number, fees: number, previousVolumeUSD: number, previousFees: number, liquidityUSD: number, previousLiquidity: number}[]> => {

  let result = [];
  for (let i=0; i< tokenData.numPools.toNumber(); i++) {
    result.push({ volumeUSD: 0, fees: 0, previousVolumeUSD: 0, previousFees: 0, liquidityUSD: 0, previousLiquidity: 0 })
  }

  const doc = await getGoogleSheetsDoc();
  const analyticsSheet = await doc.sheetsByTitle["Pool Analytics"]
  await analyticsSheet.loadCells();

  for (let row = 1; row < 1 + tokenData.numPools.toNumber(); row++) {
      const poolIndexVolume = analyticsSheet.getCell(row, 0).formattedValue
      if (poolIndexVolume !== null) {
        const volumeUSD = Number(analyticsSheet.getCell(row, 2).formattedValue)
        const fees = Number(analyticsSheet.getCell(row, 1).formattedValue)
        const index = Number(poolIndexVolume)
        result[index] = {...result[index], volumeUSD, fees };
      }

      const poolIndexPrevVolume = analyticsSheet.getCell(row, 3).formattedValue
      if (poolIndexPrevVolume !== null) {
        const previousVolumeUSD = Number(analyticsSheet.getCell(row, 5).formattedValue)
        const previousFees = Number(analyticsSheet.getCell(row, 4).formattedValue)
        const index = Number(poolIndexPrevVolume)
        result[index] = {...result[index], previousVolumeUSD, previousFees };
      }

      const poolIndexLiquidity = analyticsSheet.getCell(row, 7).formattedValue
      if (poolIndexLiquidity !== null) {
        const liquidity = Number(analyticsSheet.getCell(row, 8).formattedValue)
        result[Number(poolIndexLiquidity)].liquidityUSD = liquidity;
      }

      const poolIndexPrevLiquidity = analyticsSheet.getCell(row, 10).formattedValue
      if (poolIndexPrevLiquidity !== null) {
        const previousLiquidity = Number(analyticsSheet.getCell(row, 11).formattedValue)
        result[Number(poolIndexPrevLiquidity)].previousLiquidity = previousLiquidity;
      }
  }

  return result;
}

export const fetchLatestPoolPrices = async (poolIndex: number, startingTimestamp: number, intervalSeconds: number = 60) => {
  const doc = await getGoogleSheetsDoc()
  
  const sheet = await doc.sheetsByTitle["Pool Prices"]
  await sheet.loadCells();
  const tsColumn = poolIndex * 2;
  const priceColumn = tsColumn + 1;

  let row = 1;
  let currentPrice = undefined;
  let result: {ts: number, price: number}[] = []
  const MAX_ITERATIONS = 100000; // Safety net.
  while (row < MAX_ITERATIONS) {
    let ts = sheet.getCell(row, tsColumn).formattedValue
    if (ts === null) break;

    if (ts >= startingTimestamp && currentPrice !== undefined) {
      let intervalTs = ts - ts % intervalSeconds
      result.push({ts: intervalTs, price: currentPrice})
    }
    const price = sheet.getCell(row, priceColumn).formattedValue
    currentPrice = price;

    row++
  }

  return result;
}