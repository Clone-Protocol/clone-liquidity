import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { Box } from '@mui/material'

interface Props {
  centerPrice: number
  lowerLimit: number
  upperLimit: number
}

const ConcentrationRangeView: React.FC<Props> = ({ centerPrice, lowerLimit, upperLimit }) => {
  const centerPricePercent = (centerPrice - lowerLimit) * 100 / (upperLimit - lowerLimit)

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '30px', marginBottom: '16px' }}>
      <LeftBox>{lowerLimit.toFixed(2)}</LeftBox>
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
          <LeftRangeStick />
          <RangeBar />
          <RightRangeStick />
        </Box>

        <CenterStick sx={{ marginLeft: '50%' }} />
        <Stick sx={{ marginLeft: `calc(${centerPricePercent}%)` }} />
      </Box>
      <RightBox>{upperLimit.toFixed(2)}</RightBox>
    </Box>
  )
}

const LeftRangeStick = styled('div')`
  position: relative;
  border-radius: 0;
  background: #809cff;
  width: 2px;
  height: 12px;
  margin-top: -12px;
  z-index: 20;
`

const RightRangeStick = styled('div')`
  position: relative;
  border-radius: 0;
  background: #0038ff;
  width: 2px;
  height: 12px;
  margin-top: -12px;
  z-index: 20;
`

const CenterStick = styled('div')`
  position: relative;
	border-radius: 0;
	background: #fff;
	width: 3px;
	height: 12px;
	margin-top: -12px;
  z-index: 20;
`

const Stick = styled('div')`
  position: relative;
	border-radius: 0;
	background: #fff;
	width: 3px;
	height: 17px;
	margin-top: -10px;
  z-index: 20;
`

const LeftBox = styled(Box)`
  height: 28px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  text-align: center;
  margin-right: -10px;
`

const RightBox = styled(Box)`
  height: 28px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  text-align: center;
  margin-left: -10px;
`

const RangeBar = styled('div')`
  width: 173px;
  height: 5px;  
  background: linear-gradient(to right, #809cff -1%, #0038ff 109%);
`

export default withCsrOnly(ConcentrationRangeView)
