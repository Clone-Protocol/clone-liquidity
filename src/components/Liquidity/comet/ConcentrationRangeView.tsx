import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { Box } from '@mui/material'
// import { AssetData } from '~/features/Overview/Asset.query'
import { PositionInfo, CometInfo } from '~/features/MyLiquidity/CometPosition.query'

interface Props {
	assetData: PositionInfo
  cometData: CometInfo
	max: number
}

const ConcentrationRangeView: React.FC<Props> = ({ assetData, cometData, max }) => {
	const maxLimit = max

	const centerPricePercent = (assetData.price * 100) / maxLimit
	
	return (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '30px', marginBottom: '16px' }}>
      <LeftBox>{cometData.lowerLimit.toFixed(2)}</LeftBox>
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%'}}>
          <RangeBar />
        </Box>
        
        <CenterStick sx={{ marginLeft: '50%' }} />
        <Stick sx={{ marginLeft: `calc(${centerPricePercent}%)` }} />
      </Box>
      <RightBox>{cometData.upperLimit.toFixed(2)}</RightBox>
    </Box>
	)
}

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
  margin-right: -2px;
`

const RightBox = styled(Box)`
  height: 28px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  text-align: center;
  margin-left: -2px;
`

const RangeBar = styled('div')`
  width: 173px;
  height: 5px;  
  background: linear-gradient(to right, #809cff -1%, #0038ff 109%);
`

export default withCsrOnly(ConcentrationRangeView)
