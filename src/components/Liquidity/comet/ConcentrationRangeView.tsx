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
        <CenterPriceBox sx={{ left: `calc(${centerPricePercent}% - 20px)` }}>
          {assetData.price.toFixed(2)}
          <Stick />
        </CenterPriceBox>
      </Box>
      <RightBox>{cometData.upperLimit.toFixed(2)}</RightBox>
    </Box>
	)
}

const CenterPriceBox = styled(Box)`
	position: absolute;
	left: calc(50% - 24px);
	bottom: 34px;
	height: 24px;
	border-radius: 10px;
	border: solid 2px #fffdfd;
  padding-left: 5px;
  padding-right: 5px;
	text-align: center;
	font-size: 12px;
	font-weight: 500;
	color: #fff;
`

const Stick = styled('div')`
	border: 1px solid #fff;
	border-radius: 0;
	background: #fff;
	width: 1px;
	height: 33px;
	margin-top: 5px;
	margin-left: calc(50%);
`

const LeftBox = styled(Box)`
  width: 86px;
  height: 28px;
  padding: 4px 18px 3px;
  border: solid 1px #00f0ff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  text-align: center;
  margin-right: -2px;
`

const RightBox = styled(Box)`
  width: 86px;
  height: 28px;
  padding: 4px 17px 3px 19px;
  border: solid 1px #0038ff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  text-align: center;
  margin-left: -2px;
`

const RangeBar = styled('div')`
  width: 173px;
  height: 5px;  
  background: linear-gradient(to right, #00f0ff -1%, #0038ff 109%);
`

export default withCsrOnly(ConcentrationRangeView)
