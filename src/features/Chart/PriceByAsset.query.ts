import moment from 'moment'
import { Query, useQuery } from 'react-query'
import { ChartElem } from './Liquidity.query'
import { fetchPythPriceHistory } from '~/utils/pyth'


export const fetchPriceHistory = async ({ pythSymbol }: { pythSymbol: string | undefined }) => {
  if (!pythSymbol) return null

  const history = await fetchPythPriceHistory(
    pythSymbol,
    "devnet",
    "1M"
  );
  
  const chartData = history.map((data) => {
    return {time: data.timestamp, value: data.close_price}
  })

  const lastEntry = chartData[chartData.length-1];

  const previous24hrDatetime = moment(lastEntry.time).utc(
  ).subtract(1, 'days');

  let previous24hrPrice = lastEntry.value;
  for (let {time, value} of chartData) {
    const entryTime = moment(time).utc()
    if (entryTime > previous24hrDatetime) {
      break;
    }
    previous24hrPrice = value;
  }

  const currentPrice = lastEntry.value;
  const rateOfPrice = currentPrice - previous24hrPrice
  const percentOfRate = 100 * rateOfPrice / previous24hrPrice

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
  pythSymbol: string | undefined
  refetchOnMount?: boolean | "always" | ((query: Query) => boolean | "always")
  enabled?: boolean
}

export function usePriceHistoryQuery({ pythSymbol, refetchOnMount, enabled = true }: GetProps) {
  return useQuery(['priceHistory', pythSymbol], () => fetchPriceHistory({ pythSymbol }), {
    refetchOnMount,
    enabled
  })
}