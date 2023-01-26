import { styled, Stack, Box } from '@mui/material'
import Image from 'next/image'

interface Props {
	tickerIcon: string
	tickerSymbol: string | null
	value?: number
	usdValue?: number
	handleOpenEdit: (type: number) => void
}

const CollateralPairView: React.FC<Props> = ({ tickerIcon, tickerSymbol, value, usdValue, handleOpenEdit }) => {
	return (
		<Box display="flex">
			<FormStack direction="row" justifyContent="space-between" alignItems="center" onClick={() => handleOpenEdit(0)}>
				<Box display="flex">
					<Image src={tickerIcon} width="28px" height="28px" />
					<TickerWrapper>
						<TickerSymbol>{tickerSymbol}</TickerSymbol>
					</TickerWrapper>
				</Box>
				<Box>
					<AmountView>{value?.toFixed(3)}</AmountView>
					<DollarView>${usdValue?.toLocaleString()} USD</DollarView>
				</Box>
			</FormStack>
			{/* <Box marginLeft='8px'>
				<PlusButton onClick={() => handleOpenEdit(0)}><AddRoundedIcon fontSize='small' /></PlusButton>
				<MinusButton onClick={() => handleOpenEdit(1)}><RemoveRoundedIcon fontSize='small' /></MinusButton>
			</Box> */}
		</Box>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 64px;
	padding: 11px 14px 9px 13px;
	border: solid 1px ${(props) => props.theme.boxes.greyShade};
	cursor: pointer;
	&:hover {
		background-color: ${(props) => props.theme.boxes.darkBlack};
	}
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

const DollarView = styled('div')`
	font-size: 10px; 
	text-align: right; 
	color: #b9b9b9; 
	margin-right: 18px;
`

const PlusButton = styled('div')`
	width: 26px;
	height: 25px;
	padding-left: 2px;
  border-radius: 10px;
  border: solid 1px #8c73ac;
	cursor: pointer;
	line-height: 20px;
`

const MinusButton = styled('div')`
	width: 26px;
	height: 25px;
	padding-left: 2px;
	border-radius: 10px;
	border: solid 1px #535353;
	cursor: pointer;
	line-height: 20px;
	margin-top: 4px;
`

export default CollateralPairView
