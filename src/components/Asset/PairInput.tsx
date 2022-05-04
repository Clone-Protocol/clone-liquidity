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
					<Box sx={{ fontSize: '12px', fontWeight: '500', marginBottom: '2px', color: '#949494' }}>
						{headerTitle}: {headerValue && headerValue > 0 ? headerValue : '_'}
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
