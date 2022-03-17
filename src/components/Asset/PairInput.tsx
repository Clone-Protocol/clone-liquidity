import { FormControl, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'

interface Props {
	tickerIcon: string
	tickerName: string | null
	tickerSymbol: string | null
	value?: number
	headerTitle?: string
	headerValue?: number
	onChange?: any
}

const PairInput: React.FC<Props> = ({
	tickerIcon,
	tickerName,
	tickerSymbol,
	value,
	headerTitle,
	headerValue,
	onChange,
}) => {
	return (
		<FormControl variant="standard" sx={{ width: '100%' }}>
			{headerTitle ? (
				<Stack direction="row" justifyContent="flex-end">
					<Box sx={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>
						{headerTitle}: {headerValue}
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
				<InputAmount id="ip-amount" type="number" value={value} onChange={onChange} />
			</FormStack>
		</FormControl>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 60px;
	padding: 11px 23px 12px 19px;
	border-radius: 8px;
	background-color: #333333;
`

const TickerSymbol = styled('div')`
	font-size: 15px;
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
	font-size: 20px;
	font-weight: 500;
	color: #fff;
`

export default PairInput
