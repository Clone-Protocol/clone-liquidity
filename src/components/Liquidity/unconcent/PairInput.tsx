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
				{!balanceDisabled ? <Box sx={{ fontSize: '12px', fontWeight: '500', color: '#949494', marginRight: '15px' }}>Balance: <span style={{color:'#90e4fe'}}>{balance?.toLocaleString()} {tickerSymbol}</span></Box> : <></>}
			</Stack>
      <Box
        sx={{
          borderRadius: '10px', border: 'solid 1px #444', background: '#252627'
        }}>   
        <InputStack direction="row" justifyContent="space-between" alignItems="center">
          <Box display="flex">
            <Image src={tickerIcon} width="28px" height="28px" />
            <Box sx={{ width: '100px', marginLeft: '8px', textAlign: 'left' }}>
              <TickerSymbol>{tickerSymbol}</TickerSymbol>
              {/* <TickerName>{tickerName}</TickerName> */}
            </Box>
          </Box>
          <InputAmount id="ip-amount" type="number" value={value} onChange={onChange} min={0} max={!balanceDisabled ? balance : 1000} disabled={disabled} />
        </InputStack>
        <CurrentPrice style={{ borderTop: '1px solid #444'}}>Current: {balance?.toLocaleString()} {tickerSymbol}</CurrentPrice>
      </Box>
		</FormControl>
	)
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 54px;
	padding: 9px 21px 8px 24px;
  border: solid 1px #444;
	border-top-left-radius: 10px;
  border-top-right-radius: 10px;
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

const CurrentPrice = styled('div')`
  font-size: 11px;
  font-weight: 500;
  padding-top: 6px;
  padding-bottom: 6px;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #949494;
`

export default PairInput
