import { styled, Typography, Box } from '@mui/material'
import { usePoolAnalyticsQuery } from '~/features/Overview/PoolAnalytics.query'

const TxtPriceRate = ({ val, rate }: { val: number, rate: number }) => {
  if (isFinite(rate)) {
    if (rate >= 0) {
      return (
        <Typography variant="p_sm" color='#4fe5ff'>+{val.toLocaleString()} ({rate.toLocaleString()}%) past 24h</Typography>
      )
    } else {
      return (
        <Typography variant="p_sm" color="#258ded">-{Math.abs(val).toLocaleString()} ({rate.toLocaleString()}%) past 24h</Typography>
      )
    }
  } else {
    return <></>
  }
}

const PositionAnalytics = ({ price, tickerSymbol }: { price: number, tickerSymbol: string }) => {
  const { data: resultData } = usePoolAnalyticsQuery({
    tickerSymbol,
    refetchOnMount: "always",
    enabled: tickerSymbol != null
  })

  return resultData ? (
    <Box>
      <Box mb="12px"><Typography variant="p_lg">{tickerSymbol} Borrow Position Analytics</Typography></Box>
      <DataBox>
        <Box><Typography variant="p_sm">Total Borrowed</Typography></Box>
        <Box><Typography variant="p_lg" mr='5px'>{(resultData?.currentAmountBorrowed).toLocaleString()} {tickerSymbol}</Typography>
          {/* <Typography variant='p' color='#989898'>(${(price * resultData?.currentAmountBorrowed).toLocaleString()} USD)</Typography>  */}
          <TxtPriceRate val={resultData!.currentAmountBorrowed * resultData!.amountBorrowedRate} rate={resultData!.amountBorrowedRate} /></Box>
      </DataBox>
      <DataBox>
        <Box><Typography variant="p_sm">TVL</Typography></Box>
        <Box><Typography variant="p_lg">${resultData?.currentTVL.toLocaleString()} USD</Typography> <TxtPriceRate val={resultData!.currentTVL * resultData!.tvlRate} rate={resultData!.tvlRate} /></Box>
      </DataBox>
    </Box>
  ) : <></>
}

const DataBox = styled(Box)`
  width: 100%;
  height: 61px;
  margin-bottom: 12px;
  padding: 4px 16px;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`

export default PositionAnalytics
