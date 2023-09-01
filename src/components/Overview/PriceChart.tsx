import React from "react"
import { Box, Typography } from "@mui/material"
import Image from "next/image"
// import dynamic from 'next/dynamic'
import LineChart from "~/components/Charts/LineChart"
import { usePriceHistoryQuery } from "~/features/Chart/PriceByAsset.query"
// import { unixToDate } from '~/utils/date'
import withSuspense from "~/hocs/withSuspense"
import { LoadingProgress } from "~/components/Common/Loading"

interface Props {
  assetData: PositionInfo
  isOraclePrice?: boolean
  priceTitle: string
}

interface PositionInfo {
  tickerIcon: string
  tickerName: string
  tickerSymbol: string | null
  pythSymbol: string
  price: number
  tightRange?: number
  maxRange?: number
  centerPrice?: number
}

const PriceChart: React.FC<Props> = ({ assetData, isOraclePrice = false, priceTitle }) => {
  const { data: priceHistory } = usePriceHistoryQuery({
    pythSymbol: assetData?.pythSymbol,
    isOraclePrice: isOraclePrice,
    refetchOnMount: true,
    enabled: assetData != null,
  })

  return priceHistory ? (
    <>
      <Box display="flex" alignItems='center'>
        <Image src={assetData.tickerIcon} width={30} height={30} alt={assetData.tickerSymbol!} />
        <Typography variant="h3" fontWeight={500} ml='14px'>
          {assetData.tickerName}
        </Typography>
        <Typography variant="h3" fontWeight={500} color='#66707e' ml='8px'>
          {assetData.tickerSymbol}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mt='10px'>
        <Typography variant="h2" fontWeight={500}>
          $
          {isOraclePrice
            ? priceHistory.currentPrice?.toLocaleString(undefined, { maximumFractionDigits: 3 })
            : assetData.price.toLocaleString()}
        </Typography>
        <Typography variant="p_lg" color="#66707e" ml="10px">
          {priceTitle}
        </Typography>
      </Box>
      {isOraclePrice && priceHistory.rateOfPrice && (
        <Typography variant="p" color="#4fe5ff">
          {priceHistory.rateOfPrice >= 0 ? "+" : "-"}$
          {Math.abs(priceHistory.rateOfPrice).toFixed(3)} ({priceHistory.percentOfRate?.toFixed(2)}%)
          past 24h
        </Typography>
      )}
      <LineChart data={priceHistory.chartData} />
    </>
  ) : (
    <></>
  )
}

export default withSuspense(PriceChart, <LoadingProgress />)
