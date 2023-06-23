import moment from 'moment'
import { Query, useQuery } from 'react-query'
import { ChartElem } from './Liquidity.query'
import { fetchPythPriceHistory } from '~/utils/pyth'
import { getDailyPoolPrices30Day } from '~/utils/assets'
import { ASSETS } from 'src/data/assets'

export const fetchOraclePriceHistory = async ({ pythSymbol, isOraclePrice }: { pythSymbol: string | undefined, isOraclePrice: boolean }) => {
  if (!pythSymbol) return null

  let chartData = []
  let currentPrice
  let rateOfPrice
  let percentOfRate
  // MEMO: Always use oracle until we fix the indexing.
  isOraclePrice = true

  // oracle price:
  if (isOraclePrice) {
    const history = await fetchPythPriceHistory(
      pythSymbol,
      "devnet",
      "1M"
    );

    chartData = history.map((data) => {
      return { time: data.timestamp, value: data.close_price }
    })

    const lastEntry = chartData[chartData.length - 1];

    const previous24hrDatetime = moment(lastEntry.time).utc(
    ).subtract(1, 'days');

    let previous24hrPrice = lastEntry.value;
    for (let { time, value } of chartData) {
      const entryTime = moment(time).utc()
      if (entryTime > previous24hrDatetime) {
        break;
      }
      previous24hrPrice = value;
    }

    currentPrice = lastEntry.value;
    rateOfPrice = currentPrice - previous24hrPrice
    percentOfRate = 100 * rateOfPrice / previous24hrPrice

  } else {
    // Get pool index from pythSymbol
    let poolIndex = (() => {
      for (let i = 0; i < ASSETS.length; i++) {
        if (ASSETS[i].pythSymbol === pythSymbol) {
          return i;
        }
      }
      throw new Error(`Couldn't find pool index for ${pythSymbol}`)
    })()

    chartData = await getDailyPoolPrices30Day(
      poolIndex,
    )
  }

  const allValues = chartData.map(elem => elem.value!)
  const maxValue = Math.floor(Math.max(...allValues))
  const minValue = Math.floor(Math.min(...allValues))

  return {
    chartData,
    currentPrice,
    rateOfPrice,
    percentOfRate,
    maxValue,
    minValue
  }
}

export interface PriceHistory {
  chartData: ChartElem[]
  currentPrice: number
  rateOfPrice: number
  percentOfRate: number
}

interface GetProps {
  pythSymbol: string | undefined
  isOraclePrice?: boolean
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export function usePriceHistoryQuery({ pythSymbol, isOraclePrice = false, refetchOnMount, enabled = true }: GetProps) {
  return useQuery(['oraclePriceHistory', pythSymbol], () => fetchOraclePriceHistory({ pythSymbol, isOraclePrice }), {
    refetchOnMount,
    enabled
  })
}



