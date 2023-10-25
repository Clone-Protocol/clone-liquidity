//@DEPRECATED
import { styled, Stack, Box } from '@mui/material'
import Image from 'next/image'
import 'animate.css'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'

interface Props {
	tickerIcon?: string
	tickerName?: string | null
	tickerSymbol?: string | null
	value?: number
}

const PriceIndicatorBox: React.FC<Props> = ({ tickerIcon, tickerName, tickerSymbol, value }) => {
	return (
		<StyledStack direction="row" justifyContent="space-between" alignItems="center">
			<Box display="flex">
				<Image src={tickerIcon!} width={28} height={28} alt={tickerName!} />
				<TickerWrapper>{tickerName} ({tickerSymbol})</TickerWrapper>
			</Box>
			<PriceWrapper>
				<PriceHeader>clAsset Price <InfoTooltip title={TooltipTexts.priceIndicator} /></PriceHeader>
				<PriceValue>
					{value?.toFixed(2)} <span style={{ fontSize: '14px' }}>USD</span>
				</PriceValue>
			</PriceWrapper>
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

const TickerWrapper = styled(Box)`
	margin-left: 14px; 
	font-size: 15px; 
	font-weight: 600; 
	margin-top: 3px;
`

const PriceWrapper = styled(Box)`
	text-align: right; 
	display: flex; 
	align-items: center;
`

const PriceHeader = styled(Box)`
	font-size: 12px; 
	font-weight: 500; 
	color: #6c6c6c;
`
const PriceValue = styled(Box)`
	font-size: 18px; 
	font-weight: 500;
	margin-left: 15px;
`

export default PriceIndicatorBox
