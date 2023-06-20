import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { Box, Stack, Typography } from '@mui/material'

interface Props {
  centerPrice: number
  lowerLimit: number
  upperLimit: number
  max: number
}

const ConcentrationRangeView: React.FC<Props> = ({ centerPrice, lowerLimit, upperLimit, max }) => {
  // const centerPricePercent = (centerPrice - lowerLimit) * 100 / (upperLimit - lowerLimit)
  const maxLimit = max
  const centerPricePercent = (centerPrice * 100) / maxLimit

  return (
    <RangeWrapper>
      <Box position='relative'>
        <Box sx={{ marginLeft: `calc(${centerPricePercent}% - 24px)` }}>
          <Stick>
            <Box display='flex' justifyContent='center' mb='-4px'><Typography variant='p_xsm'>onAsset Price</Typography></Box>
          </Stick>
        </Box>
        <Box display='flex' justifyContent='center' alignItems='flex-end' width='350px' height='3px' sx={{ background: '#333333' }}>
          <LeftRangeStick />
          <RangeBar />
          <RightRangeStick />
        </Box>

        <CenterStick sx={{ marginLeft: '50%' }} />
      </Box>
      <Box>
        <Stack direction='row' justifyContent='space-around'>
          <Box><Typography variant='p'>{lowerLimit.toFixed(5)}</Typography></Box>
          <Box><Typography variant='p'>{centerPrice.toFixed(5)}</Typography></Box>
          <Box><Typography variant='p'>{upperLimit.toFixed(5)}</Typography></Box>
        </Stack>
      </Box>
    </RangeWrapper >
  )
}

const RangeWrapper = styled(Box)`
  margin-top: 16px; 
  margin-bottom: 16px;
`
const LeftRangeStick = styled('div')`
  position: relative;
  border-radius: 0;
  background: #fff;
  width: 3px;
  height: 8px;
  margin-bottom: -5px;
`
const RangeBar = styled('div')`
  width: 230px;
  height: 3px;  
  background: #fff;
`
const RightRangeStick = styled('div')`
  position: relative;
  border-radius: 0;
  background: #fff;
  width: 3px;
  height: 8px;
  margin-bottom: -5px;
`
const CenterStick = styled('div')`
  position: relative;
	border-radius: 0;
	background: #fff;
	width: 3px;
	height: 6px;
`
const Stick = styled('div')`
  position: relative;
  width: 60px;
  height: 30px;
	color: ${(props) => props.theme.palette.primary.main};
  &::after {
    content: '▼';
    position: relative;
    margin-left: 18px;
  }
`

export default withCsrOnly(ConcentrationRangeView)
