import { FormControl, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'

interface Props {
	tickerIcon: string
	tickerSymbol: string | null
	value?: number | string
	headerTitle?: string
	headerValue?: number
	onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void
	onMax?: (value: number) => void
}

const PairInput: React.FC<Props> = ({
	tickerIcon,
	tickerSymbol,
	value,
	headerTitle,
	headerValue,
	onChange,
	onMax
}) => {
	return (
		<FormControl variant="standard" sx={{ width: '100%' }}>
			{headerTitle ? (
				<Stack direction="row" justifyContent="flex-end">
					<HeaderTitle>
						{headerTitle}: {headerValue || headerValue == 0 ? (<MaxValue onClick={() => onMax && onMax(headerValue)}>{headerValue.toLocaleString(undefined, { maximumFractionDigits: 5 })}</MaxValue>) : '_'}
					</HeaderTitle>
				</Stack>
			) : (
				<></>
			)}
			<FormStack direction="row" justifyContent="space-between" alignItems="center">
				<Box display="flex">
					<Image src={tickerIcon} width="28px" height="28px" />
					<TickerWrapper>
						<TickerSymbol>{tickerSymbol}</TickerSymbol>
					</TickerWrapper>
				</Box>
				<InputAmount id="ip-amount" type="number" placeholder='0.00' step='any' min={0} max={headerValue} sx={value && value > 0 ? { color: '#fff' } : { color: '#adadad' }} value={value} onChange={onChange} />
			</FormStack>
		</FormControl>
	)
}

const HeaderTitle = styled(Box)`
	font-size: 12px; 
	font-weight: 500; 
	margin-bottom: 2px; 
	color: #949494; 
	margin-right: 15px;
`
const MaxValue = styled('span')`
	color: #90e4fe; 
	cursor: pointer;
`
const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 54px;
	padding: 9px 21px 8px 24px;
  border: solid 1px #444444;
	border-radius: 8px;
	background-color: #282828;
  &:hover {
    border: solid 1px #809cff;
  }
`
const TickerWrapper = styled(Box)`
	width: 100px; 
	margin-left: 8px; 
	text-align: left;
`
const TickerSymbol = styled('div')`
	font-size: 14px;
	font-weight: 600;
  margin-top: 3px;
`
const InputAmount = styled(`input`)`
	width: 330px;
	margin-left: 30px;
	text-align: right;
	border: 0px;
	background-color: #282828;
	font-size: 16px;
	font-weight: 500;
	color: #adadad;
`

export default PairInput
