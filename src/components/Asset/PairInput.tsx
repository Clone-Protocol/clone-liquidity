import { FormControl, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'

interface Props {
	tickerIcon: string
	tickerSymbol: string | null
	value?: number | string
	headerTitle?: string
	headerValue?: number
	onChange?: (e: React.FormEvent<HTMLInputElement>) => void
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
					<Box sx={{ fontSize: '12px', fontWeight: '500', marginBottom: '2px', color: '#949494', marginRight: '15px' }}>
						{headerTitle}: {headerValue || headerValue == 0 ? (<span  style={{color: '#90e4fe', cursor: 'pointer'}} onClick={() => onMax && onMax(headerValue)}>{headerValue.toLocaleString(undefined, { maximumFractionDigits: 5 })}</span>) : '_'}
					</Box>
				</Stack>
			) : (
				<></>
			)}
			<FormStack direction="row" justifyContent="space-between" alignItems="center">
				<Box display="flex">
					<Image src={tickerIcon} width="28px" height="28px" />
					<Box sx={{ width: '100px', marginLeft: '8px', textAlign: 'left' }}>
						<TickerSymbol>{tickerSymbol}</TickerSymbol>
					</Box>
				</Box>
				<InputAmount id="ip-amount" type="number" placeholder='0.00' min={0} max={headerValue} sx={ value && value > 0 ? { color: '#fff' } : { color: '#adadad' }} value={value} onChange={onChange} />
			</FormStack>
		</FormControl>
	)
}

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
