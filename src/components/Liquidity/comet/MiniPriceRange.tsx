import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { Box } from '@mui/material'
import { AssetData } from '~/features/Overview/Asset.query'

interface Props {
	assetData: AssetData
	max: number
  hasRisk: boolean
}

const BG_BAR_WARNING = '#ff2929'
const BG_BAR_NORMAL = 'linear-gradient(to right, #00f0ff -1%, #0038ff 109%)'

const MiniPriceRange: React.FC<Props> = ({ assetData, max, hasRisk }) => {
	const maxLimit = max

	const centerPricePercent = (assetData.price * 100) / maxLimit
	
	return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <PriceVal>{assetData.lowerLimit.toFixed(2)}</PriceVal>
        <PriceVal>{assetData.upperLimit.toFixed(2)}</PriceVal>
      </Box>
      <Box sx={{ position: 'relative' }}>
        <Box>
          <RangeBar sx={hasRisk? { background: BG_BAR_WARNING} : { background: BG_BAR_NORMAL}} />
        </Box>
        <CenterBar sx={{ left: `calc(${centerPricePercent}% - 20px)` }} />
      </Box>
    </Box>
	)
}

const CenterBar = styled(Box)`
	position: absolute;
	left: calc(50% - 24px);
  border: 1px solid #fff;
	border-radius: 0;
	background: #fff;
	width: 3px;
	height: 18px;
`

const PriceVal = styled('div')`
  font-size: 12px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #fff;
`

const RangeBar = styled('div')`
  width: 173px;
  height: 5px;  
  background: linear-gradient(to right, #00f0ff -1%, #0038ff 109%);
`

export default withCsrOnly(MiniPriceRange)
