import { styled, Stack, Box } from '@mui/material'
import Image from 'next/image'
import 'animate.css'
import InfoTooltip from '~/components/Common/InfoTooltip'

interface Props {
	tickerIcon?: string
	tickerName?: string | null
	tickerSymbol?: string | null
	value?: number
}

const priceIndicatorTooltipText = `The price of the iAsset on Incept Markets, this value is calculated using the ratio of USDi to iAsset in the pool`

const PriceIndicatorBox: React.FC<Props> = ({ tickerIcon, tickerName, tickerSymbol, value }) => {
	return (
		<StyledStack direction="row" justifyContent="space-between" alignItems="center">
			<Box display="flex">
				<Image src={tickerIcon!} width="28px" height="28px" />
				<Box sx={{ marginLeft: '14px', fontSize: '15px', fontWeight: '600', marginTop: '3px' }}>
					{tickerName} ({tickerSymbol})
				</Box>
			</Box>
			<Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center' }}>
				<Box sx={{ fontSize: '12px', fontWeight: '500', color: '#6c6c6c' }}>iAsset Price <InfoTooltip title={priceIndicatorTooltipText} /></Box>
				<Box sx={{ fontSize: '18px', fontWeight: '500', marginLeft: '15px' }}>
					{value?.toFixed(2)} <span style={{ fontSize: '14px' }}>USD</span>
				</Box>
			</Box>
		</StyledStack>
	)
}

const StyledStack = styled(Stack)`
	border-radius: 10px;
	background-color: rgba(21, 22, 24, 0.75);
	padding-left: 25px;
	padding-right: 25px;
	height: 61px;
  animation: fadeIn;
  animation-duration: 1s;
`

export default PriceIndicatorBox
