import { styled, Typography, Box } from '@mui/material'

const TxtPriceRate = ({ val, rate }: { val: number, rate: number }) => {
  if (rate >= 0) {
    return (
      <Typography variant="p_sm" color='#4fe5ff'>+{val.toLocaleString()} ({rate}) past 24h</Typography>
    )
  } else {
    return (
      <Typography variant="p_sm" color="#258ded">-{Math.abs(val).toLocaleString()} ({rate}) past 24h</Typography>
    )
  }
}

const PositionsAnalytics = ({ tickerSymbol }: { tickerSymbol: string }) => {
  return (
    <Box>
      <Box mb="12px"><Typography variant="p_lg">{tickerSymbol} Borrow Positions Analytics</Typography></Box>
      <DataBox>
        <Box><Typography variant="p_sm">Total Borrowed</Typography></Box>
        <Box><Typography variant="p_lg">$15,430,459.49 USD</Typography> <TxtPriceRate val={245345.55} rate={1.58} /></Box>
      </DataBox>
      <DataBox>
        <Box><Typography variant="p_sm">TVL</Typography></Box>
        <Box><Typography variant="p_lg">$15,430,459.49 USD</Typography> <TxtPriceRate val={245345.55} rate={1.58} /></Box>
      </DataBox>
      <DataBox>
        <Box><Typography variant="p_sm">Global Weighted Average Collateral Ratio</Typography></Box>
        <Box><Typography variant="p_lg">$15,430,459.49 USD</Typography> <TxtPriceRate val={-513551.55} rate={-8.58} /></Box>
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

export default PositionsAnalytics
