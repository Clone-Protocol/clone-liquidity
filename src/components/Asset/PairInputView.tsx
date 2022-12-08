import { FormControl, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'

interface Props {
	tickerIcon: string
	tickerSymbol: string | null
	value?: number
}

const PairInputView: React.FC<Props> = ({ tickerIcon, tickerSymbol, value }) => {
	return (
		<FormControl variant="standard" sx={{ width: '100%' }}>
			<FormStack direction="row" justifyContent="space-between" alignItems="center">
				<Box display="flex">
					<Image src={tickerIcon} width="28px" height="28px" />
					<Box sx={{ width: '100px', marginLeft: '8px', textAlign: 'left' }}>
						<TickerSymbol>{tickerSymbol}</TickerSymbol>
					</Box>
				</Box>
				<InputAmount id="ip-amount" disabled value={value} />
			</FormStack>
		</FormControl>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 54px;
	padding: 9px 21px 8px 24px;
  background: rgba(21, 22, 24, 0.75);
	border-radius: 8px;
	border: solid 1px #5c5c5c;
`

const TickerSymbol = styled('div')`
	font-size: 14px;
	font-weight: 600;
	color: #5c5c5c;
  margin-top: 3px;
`

const InputAmount = styled(`input`)`
	width: 330px;
	margin-left: 30px;
	text-align: right;
	border: 0px;
	background-color: rgba(21, 22, 24, 0.75);
	font-size: 16px;
	font-weight: 500;
	color: #5c5c5c;
`

export default PairInputView
