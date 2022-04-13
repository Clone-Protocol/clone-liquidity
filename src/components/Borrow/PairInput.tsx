import { FormControl, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'

interface Props {
	tickerIcon: string
	tickerName: string | null
	tickerSymbol: string | null
	value?: number
	balance?: number
	balanceDisabled?: boolean
	disabled?: boolean
	onChange?: any
}

const PairInput: React.FC<Props> = ({
	tickerIcon,
	tickerName,
	tickerSymbol,
	value,
	balance,
	balanceDisabled = false,
	disabled = false,
	onChange,
}) => {
	return (
		<FormControl variant="standard" sx={{ width: '100%' }}>
			<Stack direction="row" justifyContent="flex-end">
				{!balanceDisabled ? <Box sx={{ fontSize: '12px', fontWeight: '500' }}>Balance: {balance}</Box> : <></>}
			</Stack>
			<FormStack direction="row" justifyContent="space-between" alignItems="center">
				<Box display="flex">
					<Image src={tickerIcon} width="28px" height="28px" />
					<Box sx={{ width: '100px', marginLeft: '8px', textAlign: 'left' }}>
						<TickerSymbol>{tickerSymbol}</TickerSymbol>
						{/* <TickerName>{tickerName}</TickerName> */}
					</Box>
				</Box>
				<InputAmount id="ip-amount" type="number" value={value} onChange={onChange} disabled={disabled} />
			</FormStack>
		</FormControl>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 54px;
	padding: 9px 21px 8px 24px;
	border-radius: 8px;
	background-color: #333333;
`

const TickerSymbol = styled('div')`
	font-size: 14px;
	font-weight: 600;
`

const TickerName = styled('div')`
	color: #757a7f;
	font-size: 9px;
	font-weight: 600;
	line-height: 5px;
`

const InputAmount = styled(`input`)`
	width: 330px;
	margin-left: 30px;
	text-align: right;
	border: 0px;
	background-color: #333333;
	font-size: 16px;
	font-weight: 500;
	color: #adadad;
`

export default PairInput
