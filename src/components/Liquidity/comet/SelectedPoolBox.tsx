import { styled, Box, Typography, Stack } from '@mui/material'
import Image from 'next/image'
import { PositionInfo } from '~/features/MyLiquidity/comet/LiquidityPosition.query'

interface Props {
  positionInfo: PositionInfo
}

const SelectedPoolBox: React.FC<Props> = ({ positionInfo }) => {
  return (
    <BoxWrapper>
      <Typography variant='p_lg'>Liquidity pool:</Typography>
      <Stack direction='row' alignItems='center' my='14px'>
        <Image src={positionInfo.tickerIcon} width={28} height={28} alt={positionInfo.tickerSymbol} />
        <Box sx={{ marginLeft: '9px' }}>
          <Typography variant='h3'>{positionInfo.tickerSymbol}/devUSD</Typography>
        </Box>
      </Stack>
    </BoxWrapper>
  )
}

const BoxWrapper = styled(Box)`
  background-color: ${(props) => props.theme.basis.darkNavy};
  padding: 15px 23px;
`

export default SelectedPoolBox