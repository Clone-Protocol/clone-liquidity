import { styled, Typography, Box } from '@mui/material'
import { usePoolAnalyticsQuery } from '~/features/Overview/PoolAnalytics.query'

const TxtPriceRate = ({ val, rate }: { val: number, rate: number }) => {
  if (isFinite(rate)) {
    if (rate >= 0) {
      return (
        <Typography variant="p_sm" color='#4fe5ff'>+{val.toLocaleString()} ({rate}) past 24h</Typography>
      )
    } else {
      return (
        <Typography variant="p_sm" color="#258ded">-{Math.abs(val).toLocaleString()} ({rate}) past 24h</Typography>
      )
    }
  } else {
    return <></>
  }
}

const PoolAnalytics = ({ tickerSymbol }: { tickerSymbol: string }) => {
  const { data: resultData } = usePoolAnalyticsQuery({
    tickerSymbol,
    refetchOnMount: true,
    enabled: tickerSymbol != null
  })

  return (
    <Box>
      <Box mb="12px"><Typography variant="p_lg">{tickerSymbol}/USDi Pool Analytics</Typography></Box>
      <DataBox>
        <Box><Typography variant="p_sm">Total Liquidity</Typography></Box>
        <Box><Typography variant="p_lg">${resultData?.totalLiquidity} USD</Typography> <TxtPriceRate val={resultData!.liquidityGain} rate={resultData!.liquidityGainPct} /></Box>
      </DataBox>
      <DataBox>
        <Box><Typography variant="p_sm">24h Trading Volume</Typography></Box>
        <Box><Typography variant="p_lg">${resultData?.tradingVol24h} USD</Typography> <TxtPriceRate val={resultData!.tradingVolGain} rate={resultData!.tradingVolGainPct} /></Box>
      </DataBox>
      <DataBox>
        <Box><Typography variant="p_sm">24h Fee Revenue</Typography></Box>
        <Box><Typography variant="p_lg">${resultData?.feeRevenue24hr} USD</Typography> <TxtPriceRate val={resultData!.feeRevenueGain} rate={resultData!.feeRevenueGainPct} /></Box>
      </DataBox>
    </Box>
  )
}

const DataBox = styled(Box)`
  width: 100%;
  height: 61px;
  margin-bottom: 12px;
  padding: 4px 16px;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`

export default PoolAnalytics
