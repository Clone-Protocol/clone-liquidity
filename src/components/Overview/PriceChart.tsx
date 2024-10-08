import React from "react"
import { Box, Typography } from "@mui/material"
import { styled } from '@mui/system'
import Image from "next/image"
import LineChart from "~/components/Charts/LineChart"
import { usePriceHistoryQuery } from "~/features/Chart/PriceByAsset.query"
import withSuspense from "~/hocs/withSuspense"
import { LoadingProgress } from "~/components/Common/Loading"
import AnalyticsIcon from 'public/images/analytics-sketch.svg'
import { PublicKey } from "@solana/web3.js"

interface Props {
  assetData: PositionInfo
  publicKey: PublicKey
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

const PriceChart: React.FC<Props> = ({ assetData, publicKey, isOraclePrice = false, priceTitle }) => {
  const { data: priceHistory } = usePriceHistoryQuery({
    timeframe: "24h",
    pythSymbol: assetData?.pythSymbol,
    isOraclePrice,
    refetchOnMount: true,
    enabled: assetData != null && publicKey != null,
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
      <Box display="flex" alignItems="center" my='10px'>
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
        <Typography variant="p_lg" color="#4fe5ff">
          {priceHistory.rateOfPrice >= 0 ? "+" : "-"}$
          {Math.abs(priceHistory.rateOfPrice).toFixed(3)} ({priceHistory.percentOfRate?.toFixed(2)}%)
          past 24h
        </Typography>
      )}
      <LineChart data={priceHistory.chartData} />
    </>
  ) : (
    <DefaultAnalyticsBox>
      <Box><Image src={AnalyticsIcon} alt='analytics' /></Box>
      <Typography variant='p_xlg'>Pool analytics will appear here</Typography>
    </DefaultAnalyticsBox>
  )
}

const DefaultAnalyticsBox = styled(Box)`
  width: 100%;
  height: 590px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
  color: ${(props) => props.theme.basis.shadowGloom};
`

export default withSuspense(PriceChart, <LoadingProgress />)
