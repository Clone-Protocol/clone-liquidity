import { styled, Typography, Box } from '@mui/material'

const PoolAnalytics = () => {
  return (
    <Box>
      <DataBox>
        <Box><Typography variant="p_sm">Total Liquidity</Typography></Box>
        <Box><Typography variant="p_lg">$15,430,459.49 USD</Typography> <span>+$245,345.55 (1.58%) past 24h</span></Box>
      </DataBox>
      <DataBox>
        <Box><Typography variant="p_sm">TVL</Typography></Box>
        <Box><Typography variant="p_lg">$15,430,459.49 USD</Typography> <span>+$245,345.55 (1.58%) past 24h</span></Box>
      </DataBox>
      <DataBox>
        <Box><Typography variant="p_sm">24h Trading Volume</Typography></Box>
        <Box><Typography variant="p_lg">$15,430,459.49 USD</Typography> <span>-$513,551 (-8.35%) past 24h</span></Box>
      </DataBox>
      <DataBox>
        <Box><Typography variant="p_sm">24h Fee Revenue</Typography></Box>
        <Box><Typography variant="p_lg">$30,459.12 USD</Typography> <span>-$513,551 (-8.35%) past 24h</span></Box>
      </DataBox>
    </Box>
  )
}

const DataBox = styled(Box)`
  width: 100%;
  height: 61px;
  padding: 8px;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`

export default PoolAnalytics
