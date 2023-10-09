import { styled, Typography, Box } from '@mui/material'
import { usePoolAnalyticsQuery } from '~/features/Overview/PoolAnalytics.query'

const TxtPriceRate = ({ val, rate }: { val: number, rate: number }) => {
  if (isFinite(rate)) {
    if (rate >= 0) {
      return (
        <Typography variant="p" color='#4fe5ff'>+{rate.toLocaleString()}%</Typography>
      )
    } else {
      return (
        <Typography variant="p" color="#258ded">-{rate.toLocaleString()}%</Typography>
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

  const relativeVal = (currentVal: number, rate: number) => {
    const prev = currentVal / (1 + rate / 100)
    return (
      currentVal - prev
    )
  }

  return resultData ? (
    <Box>
      <Box my="12px"><Typography variant="p_lg">{tickerSymbol} Borrow Position Analytics</Typography></Box>
      <DataBox>
        <Box><Typography variant="p" color='#66707e'>Total Borrowed</Typography></Box>
        <Box whiteSpace='nowrap'><Typography variant="p_xlg">{(resultData?.currentAmountBorrowed).toLocaleString()} {tickerSymbol}</Typography> <Typography variant='p_xlg' color='#66707e' mx='10px'>${(price * resultData?.currentAmountBorrowed).toLocaleString()} USD</Typography> <TxtPriceRate val={relativeVal(resultData!.currentAmountBorrowed, resultData!.amountBorrowedRate)} rate={resultData!.amountBorrowedRate} /></Box>
      </DataBox>
      <DataBox>
        <Box><Typography variant="p" color='#66707e'>TVL (Collateral)</Typography></Box>
        <Box><Typography variant="p_xlg" mr='10px'>${resultData?.currentTVL.toLocaleString()} USD</Typography> <TxtPriceRate val={relativeVal(resultData!.currentTVL, resultData!.tvlRate)} rate={resultData!.tvlRate} /></Box>
      </DataBox>
    </Box>
  ) : <></>
}

const DataBox = styled(Box)`
  width: 100%;
  height: 61px;
  margin-bottom: 12px;
  padding: 4px 16px;
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`

export default PositionAnalytics
