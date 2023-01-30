import { styled, Typography, Box } from '@mui/material'

const PoolAnalytics = () => {
  return (
    <Box>
      <DataBox>
        <Box>Total Liquidity</Box>
        <Box>$15,430,459.49 USD <span>+$245,345.55 (1.58%) past 24h</span></Box>
      </DataBox>
      <DataBox>
        <Box>TVL</Box>
        <Box>$15,430,459.49 USD <span>+$245,345.55 (1.58%) past 24h</span></Box>
      </DataBox>
      <DataBox>
        <Box>24h Trading Volume</Box>
        <Box>$15,430,459.49 USD <span>-$513,551 (-8.35%) past 24h</span></Box>
      </DataBox>
      <DataBox>
        <Box>24h Fee Revenue </Box>
        <Box>$30,459.12 USD <span>-$513,551 (-8.35%) past 24h</span></Box>
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
