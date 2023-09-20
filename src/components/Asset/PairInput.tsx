import { FormControl, styled, Stack, Box, Typography } from '@mui/material'
import Image from 'next/image'

interface Props {
	tickerIcon: string
	tickerSymbol: string
	value?: number | string
	dollarPrice?: number | undefined
	headerTitle?: string
	headerValue?: number
	onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void
	onMax?: (value: number) => void
	onTickerClicked?: () => void
}

const PairInput: React.FC<Props> = ({
	tickerIcon,
	tickerSymbol,
	value,
	dollarPrice,
	headerTitle,
	headerValue,
	onChange,
	onMax,
	onTickerClicked
}) => {
	return (
		<FormControl variant="standard" sx={{ width: '100%' }}>
			{headerTitle ? (
				<Stack direction="row" justifyContent="flex-end">
					<Typography variant='p' color='#66707e'>
						{headerTitle}: {headerValue || headerValue == 0 ? (<MaxValue onClick={() => onMax && onMax(headerValue)}>{headerValue.toLocaleString(undefined, { maximumFractionDigits: 5 })}</MaxValue>) : '_'}
					</Typography>
					{headerValue && <MaxButton onClick={() => onMax && onMax(headerValue)}>MAX</MaxButton>}
				</Stack>
			) : (
				<></>
			)}
			<FormStack direction="row" justifyContent="space-between" alignItems="center">
				<Box display="flex" alignItems='center' width='122px' onClick={onTickerClicked} style={onTickerClicked ? { cursor: 'pointer' } : {}}>
					<Image src={tickerIcon} width={28} height={28} alt={tickerSymbol} />
					<Box ml='10px'>
						<Typography variant='p_lg'>{tickerSymbol}</Typography>
					</Box>
				</Box>
				<Box lineHeight={0.93} textAlign='right'>
					<InputAmount id="ip-amount" type="number" placeholder='0.00' step='any' min={0} max={headerValue} sx={value && value > 0 ? { color: '#fff' } : { color: '#adadad' }} value={value} onChange={onChange} />
					{dollarPrice ? <Box><Typography variant='p' color='#989898'>${dollarPrice.toLocaleString()} USD</Typography></Box> : <></>}
				</Box>
			</FormStack>
		</FormControl>
	)
}

const MaxValue = styled('span')`
	color: ${(props) => props.theme.basis.liquidityBlue};
	cursor: pointer;
`
const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 70px;
	padding: 9px 21px 8px 24px;
	background-color: ${(props) => props.theme.boxes.darkBlack};
  &:hover {
		box-shadow: 0 0 0 1px ${(props) => props.theme.palette.text.secondary} inset;
  }
`
const InputAmount = styled(`input`)`
	width: 140px;
	padding: 0;
	text-align: right;
	border: 0px;
	background-color: ${(props) => props.theme.boxes.darkBlack};
	font-size: 20.7px;
	font-weight: 500;
	color: #fff;
`
const MaxButton = styled(Box)`
  border-radius: 4px;
  background-color: ${(props) => props.theme.basis.jurassicGrey};
  margin-left: 6px;
	margin-bottom: 5px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  color: #fff;
  cursor: pointer;
`

export default PairInput
