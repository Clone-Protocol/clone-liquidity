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
    <Stack direction='row' justifyContent='space-between'>
      <Box>
        <Image src={tickerIcon} width="28px" height="28px" />
        {tickerName} ({tickerSymbol})
      </Box>
      <Box>
        <Box>iAsset Price</Box>
        <Box>{value} USDi</Box>
      </Box>
    </Stack>
  )
}

export default PriceIndicatorBox
