import { FormControl, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'

interface Props {
	tickerIcon: string
	tickerSymbol: string | null
	value?: number
	balance?: number
	balanceDisabled?: boolean
	disabled?: boolean
	onChange?: (e: React.FormEvent<HTMLInputElement>) => void
  onMax?: (value: number) => void
}

const PairInput: React.FC<Props> = ({
	tickerIcon,
	tickerSymbol,
	value,
	balance,
	balanceDisabled = false,
	disabled = false,
	onChange,
  onMax
}) => {
	return (
		<FormControl variant="standard" sx={{ width: '100%' }}>
			<Stack direction="row" justifyContent="flex-end">
				{!balanceDisabled ? <Box sx={{ fontSize: '12px', fontWeight: '500', color: '#949494', marginRight: '10px' }}>Balance: <span style={{ color:'#90e4fe', cursor: 'pointer' }} onClick={() => onMax && onMax(balance!)}>{balance?.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}</span></Box> : <></>}
			</Stack>
			<InputStack direction="row" justifyContent="space-between" alignItems="center">
				<Box display="flex">
					<Image src={tickerIcon} width="28px" height="28px" />
					<Box sx={{ width: '100px', marginTop: '3px', marginLeft: '8px', textAlign: 'left' }}>
						<TickerSymbol>{tickerSymbol}</TickerSymbol>
					</Box>
				</Box>
				<InputAmount id="ip-amount" type="number" sx={ value && value > 0 ? { color: '#fff' } : { color: '#adadad' }} placeholder="0.00" min={0} value={value} onChange={onChange} disabled={disabled} />
			</InputStack>
		</FormControl>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 54px;
	padding: 9px 21px 8px 24px;
  border: solid 1px #444;
	border-radius: 8px;
	background-color: #333333;
`

const TickerSymbol = styled('div')`
	font-size: 14px;
	font-weight: 600;
`

const InputStack = styled(FormStack)`
  &:hover {
    border: solid 1px #809cff;
  }
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
