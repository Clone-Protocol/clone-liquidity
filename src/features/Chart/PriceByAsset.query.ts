import { useQuery } from '@tanstack/react-query'
import { ChartElem } from './Liquidity.query'
import { Range, fetchPythPriceHistory } from '~/utils/pyth'
import { getDailyPoolPrices30Day } from '~/utils/assets'
import { ASSETS, assetMapping } from 'src/data/assets'
import { FilterTime } from '~/components/Charts/TimeTabs'

export const fetchOraclePriceHistory = async ({ assetIndex, timeframe, pythSymbol, isOraclePrice }: { assetIndex: number, timeframe: FilterTime, pythSymbol: string | undefined, isOraclePrice: boolean }) => {
  if (!pythSymbol) return null

  let chartData = []
  let currentPrice
  let rateOfPrice
  let percentOfRate
  // MEMO: Always use oracle until we fix the indexing.
  isOraclePrice = true

  // oracle price:
  if (isOraclePrice) {
    const range: Range = (() => {
      switch (timeframe) {
        case '1y':
          return "1Y"
        case '30d':
          return "1M"
        case '7d':
          return "1W"
        case '24h':
          return "1D"
        default:
          throw new Error(`Unexpected timeframe: ${timeframe}`)
      }
    })()

    const { scalingFactor } = assetMapping(assetIndex)
    const history = await fetchPythPriceHistory(pythSymbol, range);

    chartData = history.map((data) => {
      return { time: data.timestamp, value: data.price }
    })

    const lastEntry = chartData[chartData.length - 1];
    const firstEntry = chartData[0]
    const previous24hrPrice = firstEntry.value * scalingFactor

    currentPrice = lastEntry.value * scalingFactor;
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
  assetIndex: number
  timeframe: FilterTime
  pythSymbol: string | undefined
  isOraclePrice?: boolean
  refetchOnMount?: boolean | "always"
  enabled?: boolean
}

export function usePriceHistoryQuery({ assetIndex, timeframe, pythSymbol, isOraclePrice = false, refetchOnMount, enabled = true }: GetProps) {
  return useQuery({
    queryKey: ['oraclePriceHistory', timeframe, pythSymbol],
    queryFn: () => fetchOraclePriceHistory({ assetIndex, timeframe, pythSymbol, isOraclePrice }),
    refetchOnMount,
    enabled
  })
}



