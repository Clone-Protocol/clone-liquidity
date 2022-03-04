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
    <StyledStack direction='row' justifyContent='space-between'>
      <Box display="flex">
        <Image src={tickerIcon} width="28px" height="28px" />
        <Box sx={{ margin: '10px' }}>{tickerName} ({tickerSymbol})</Box>
      </Box>
      <Box>
        <Box sx={{ fontSize: '12px', fontWeight: '500', color: '#6c6c6c' }}>Indicator Price</Box>
        <Box sx={{ fontSize: '20px', fontWeight: '500' }}>{value} USD</Box>
      </Box>
    </StyledStack>
  )
}

const StyledStack = styled(Stack)`
  border-radius: 10px;
  border: solid 1px #535353;
  background-color: #171717;
  padding: 20px;
`

export default PriceIndicatorBox
