import { FormControl, styled, Stack, Box, Button } from '@mui/material'
import Image from 'next/image'
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

interface Props {
	tickerIcon: string
	tickerSymbol: string | null
	value?: number
	usdValue?: number
	handleOpenEdit?: any
}

const CollateralPairView: React.FC<Props> = ({ tickerIcon, tickerSymbol, value, usdValue, handleOpenEdit }) => {
	
	
	return (
		<Box display="flex">
			<FormStack direction="row" justifyContent="space-between" alignItems="center">
				<Box display="flex">
					<Image src={tickerIcon} width="28px" height="28px" />
					<Box sx={{ width: '100px', marginLeft: '8px', textAlign: 'left' }}>
						<TickerSymbol>{tickerSymbol}</TickerSymbol>
					</Box>
				</Box>
				<Box>
					<AmountView>{value?.toFixed(3)}</AmountView>
					<DollarView>${usdValue?.toLocaleString()}</DollarView>
				</Box>
			</FormStack>
			<Box sx={{ marginLeft: '8px' }}>
				<PlusButton onClick={() => handleOpenEdit(0)}><AddRoundedIcon fontSize='small' /></PlusButton>
				<MinusButton onClick={() => handleOpenEdit(1)}><RemoveRoundedIcon fontSize='small' /></MinusButton>
			</Box>
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
