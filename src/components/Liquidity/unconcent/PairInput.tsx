import { FormControl, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'

interface Props {
  tickerIcon: string
  tickerSymbol: string | null
  value?: number
  valueDollarPrice?: number
  balance?: number
  currentAmount?: number
  dollarPrice?: number
  balanceDisabled?: boolean
  disabled?: boolean
  onChange?: (e: React.FormEvent<HTMLInputElement>) => void
  onMax?: (value: number) => void
}

const PairInput: React.FC<Props> = ({
  tickerIcon,
  tickerSymbol,
  value,
  valueDollarPrice,
  balance,
  currentAmount,
  dollarPrice,
  balanceDisabled = false,
  disabled = false,
  onChange,
  onMax
}) => {
  return (
    <FormControl variant="standard" sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="flex-end">
        {!balanceDisabled ? <Box sx={{ fontSize: '12px', fontWeight: '500', color: '#949494', marginRight: '15px' }}>Balance: <span style={{ color: '#90e4fe', cursor: 'pointer' }} onClick={() => onMax && onMax(balance!)}>{balance?.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}</span></Box> : <></>}
      </Stack>
      <WrapperBox>
        <InputStack direction="row" justifyContent="space-between" alignItems="center">
          <Box display="flex">
            <Image src={tickerIcon} width="28px" height="28px" />
            <TickerWrapper>
              <TickerSymbol>{tickerSymbol}</TickerSymbol>
            </TickerWrapper>
          </Box>
          <Box>
            <InputAmount id="ip-amount" type="number" placeholder="0.00" value={value} onChange={onChange} min={0} max={!balanceDisabled ? balance : 1000} disabled={disabled} />
            <DollarAmount>{(valueDollarPrice && valueDollarPrice > 0) ? ('$' + valueDollarPrice?.toLocaleString()) : ''}</DollarAmount>
          </Box>
        </InputStack>
        <CurrentPrice>Current: <span style={{ color: '#fff' }}>{currentAmount?.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol} {dollarPrice && '($' + dollarPrice.toLocaleString() + ')'}</span></CurrentPrice>
      </WrapperBox>
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

const WrapperBox = styled(Box)`
  border-radius: 10px; 
  border: solid 1px #444; 
  background: #252627;
`

const TickerWrapper = styled(Box)`
  width: 100px; 
  margin-left: 8px; 
  text-align: left;
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
	color: #fff;
`

const DollarAmount = styled('div')`
  font-size: 10px; 
  text-align: right; 
  color: #b9b9b9; 
  margin-right: 18px;
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
  border-top: 1px solid #444;
`

export default PairInput
