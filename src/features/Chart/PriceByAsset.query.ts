import { Query, useQuery } from 'react-query'
import { ChartElem } from './Liquidity.query'

export const fetchPriceHistory = async ({ tickerSymbol }: { tickerSymbol: string | undefined }) => {
  if (!tickerSymbol) return null

  // @TODO: need providing price history based on ticker symbol

  const chartData = [
    {
      time: '2022-03-01',
      value: 15
    },
    {
      time: '2022-03-02',
      value: 35
    },
    {
      time: '2022-03-03',
      value: 80
    },
    {
      time: '2022-03-04',
      value: 65
    },
    {
      time: '2022-03-05',
      value: 115
    },
  ]

  const currentPrice = 160.51
  const rateOfPrice = 2.551 // or -2.551
  const percentOfRate = 1.58

  return {
    chartData,
    currentPrice,
    rateOfPrice,
    percentOfRate
  }
}

export interface PriceHistory {
  chartData: ChartElem[]
  currentPrice: number
  rateOfPrice: number
  percentOfRate: number
}

interface GetProps {
  tickerSymbol: string | undefined
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export function usePriceHistoryQuery({ tickerSymbol, refetchOnMount, enabled = true }: GetProps) {
  return useQuery(['priceHistory', tickerSymbol], () => fetchPriceHistory({ tickerSymbol }), {
    refetchOnMount,
    enabled
  })
}