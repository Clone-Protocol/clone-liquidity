import { styled, Stack, Box, Typography } from '@mui/material'
import Image from 'next/image'
import { RecenterButton } from '~/components/Liquidity/LiquidityButton';

interface Props {
	poolIndex: number
	tickerIcon: string
	tickerSymbol: string | null
	value?: number
	ildValue?: number
	ildInUsdi: boolean
	onShowEditDialog: (poolIndex: number) => void
	onShowRecenterDialog: (poolIndex: number) => void
}

const LiquidityPairView: React.FC<Props> = ({ poolIndex, tickerIcon, tickerSymbol, value, ildValue, ildInUsdi, onShowEditDialog, onShowRecenterDialog }) => {

	const showRecenterDialog = (e: any) => {
		e.stopPropagation()
		onShowRecenterDialog(poolIndex)
	}

	return (
		<Box display="flex">
			<FormStack direction="row" justifyContent="space-between" alignItems="center" onClick={() => onShowEditDialog(poolIndex)}>
				<Box display="flex">
					<Image src={tickerIcon} width="28px" height="28px" />
					<TickerWrapper>
						<Typography variant='p'>{tickerSymbol} / USDi</Typography>
					</TickerWrapper>
				</Box>
				<Box><Typography variant='p'>${value?.toFixed(3)} USD</Typography></Box>
				<Box><Typography variant='p'>${`${ildValue?.toFixed(3)}`}</Typography></Box>
				<Box>
					<RecenterButton onClick={showRecenterDialog}></RecenterButton>
				</Box>
			</FormStack>

		</Box>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 63px;
	padding: 9px 20px;
	cursor: pointer;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
	&:hover {
		background-color: ${(props) => props.theme.boxes.darkBlack};
	}
`
const TickerWrapper = styled(Box)`
  width: 100px; 
  margin-left: 8px; 
  text-align: left;
`

// const RecenterButton = styled(Button)`
// 	width: 76px;
//   height: 25px;
// 	padding: 3px 0 4px;
// 	border-radius: 10px;
// 	border: solid 1px #8c73ac;
// 	background-color: #000;
// 	font-size: 10px;
//   font-weight: 500;
// 	text-align: center;
//   color: #fff;
// 	margin-left: 23px;
// `

export default LiquidityPairView
