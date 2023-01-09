import { styled, Stack, Box, Button } from '@mui/material'
import Image from 'next/image'

interface Props {
	poolIndex: number
	tickerIcon: string
	tickerSymbol: string | null
	value?: number
	onShowEditDialog: (poolIndex: number) => void
	onShowRecenterDialog: (poolIndex: number) => void
}

const LiquidityPairView: React.FC<Props> = ({ poolIndex, tickerIcon, tickerSymbol, value, onShowEditDialog, onShowRecenterDialog }) => {
	return (
		<Box display="flex">
			<FormStack direction="row" justifyContent="space-between" alignItems="center">
				<Box display="flex" onClick={() => onShowEditDialog(poolIndex)} sx={{ cursor: 'pointer' }}>
					<Image src={tickerIcon} width="28px" height="28px" />
					<TickerWrapper>
						<TickerSymbol>{tickerSymbol} <span style={{ fontSize: '10px' }}>/ USDi</span></TickerSymbol>
					</TickerWrapper>
				</Box>
				<AmountView>
					${value?.toFixed(3)}
					<RecenterButton onClick={() => onShowRecenterDialog(poolIndex)}>Recenter</RecenterButton>
				</AmountView>
			</FormStack>

		</Box>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 54px;
	padding: 11px 14px 9px 13px;
  background: #2d2d2d;
	border-radius: 8px;
`

const TickerWrapper = styled(Box)`
  width: 100px; 
  margin-left: 8px; 
  text-align: left;
`

const TickerSymbol = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #fff;
  margin-top: 3px;
`

const AmountView = styled(`div`)`
	text-align: right;
	font-size: 14px;
	color: #fff;
`

const RecenterButton = styled(Button)`
	width: 76px;
  height: 25px;
	padding: 3px 0 4px;
	border-radius: 10px;
	border: solid 1px #8c73ac;
	background-color: #000;
	font-size: 10px;
  font-weight: 500;
	text-align: center;
  color: #fff;
	margin-left: 23px;
`

export default LiquidityPairView
