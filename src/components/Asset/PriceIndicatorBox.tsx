import { FormControl, Input, InputAdornment, InputLabel, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'

interface Props {
  tickerIcon: string,
  tickerName: string | null,
  tickerSymbol: string | null,
  value?: number
}

const PriceIndicatorBox: React.FC<Props> = ({ tickerIcon, tickerName, tickerSymbol, value }) => {
  
  return (
    <StyledStack direction='row' justifyContent='space-between' alignItems="center">
      <Box display="flex">
        <Image src={tickerIcon} width="28px" height="28px" />
        <Box sx={{ marginLeft: '14px', fontSize: '20px' }}>{tickerName} ({tickerSymbol})</Box>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Box sx={{ fontSize: '12px', fontWeight: '500', color: '#6c6c6c' }}>Indicator Price</Box>
        <Box sx={{ fontSize: '18px', fontWeight: '500' }}>{value} <span style={{ fontSize: '14px' }}>USD</span></Box>
      </Box>
    </StyledStack>
  )
}

const StyledStack = styled(Stack)`
  border-radius: 10px;
  border: solid 1px #535353;
  background-color: #171717;
  padding-left: 40px;
  padding-right: 40px;
  height: 87px;
`

export default PriceIndicatorBox
