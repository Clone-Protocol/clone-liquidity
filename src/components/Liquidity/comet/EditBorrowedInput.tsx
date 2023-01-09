import { FormControl, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'
import { StyledTabs, StyledTab } from '~/components/Liquidity/comet/StyledTab'

interface Props {
  editType: number
  tickerIcon: string
  tickerName?: string | null
  tickerSymbol: string | null
  maxCollVal: number
  collAmount: number
  collAmountDollarPrice?: number
  currentCollAmount: number
  dollarPrice?: number
  onChangeType: (event: React.SyntheticEvent, newValue: number) => void
  onChangeAmount?: (e: React.FormEvent<HTMLInputElement>) => void
  onMax: (value: number) => void
}

const EditBorrowedInput: React.FC<Props> = ({
  editType,
  tickerIcon,
  tickerSymbol,
  maxCollVal,
  collAmount,
  collAmountDollarPrice,
  currentCollAmount,
  dollarPrice,
  onChangeType,
  onChangeAmount,
  onMax
}) => {
  return (
    <FormControl variant="standard" sx={{ width: '100%' }}>
      <Stack height='40px' direction="row" justifyContent="space-between">
        <UpperTabBox>
          <StyledTabs value={editType} onChange={onChangeType}>
            <StyledTab value={0} label="Borrow more"></StyledTab>
            <StyledTab value={1} label="Repay"></StyledTab>
          </StyledTabs>
        </UpperTabBox>
        <HeaderTitle>
          {
            editType === 0 ?
              <>
                Max borrowable:
                <MaxPointerValue onClick={() => onMax(maxCollVal)}>{maxCollVal.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}</MaxPointerValue>
              </>
              :
              <>
                Balance:
                <BalanceValue>{maxCollVal.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}</BalanceValue>
              </>
          }
        </HeaderTitle>
      </Stack>
      <CenterBox>
        <FormStack direction="row" justifyContent="space-between" alignItems="center">
          <Box display="flex">
            <Image src={tickerIcon} width="28px" height="28px" />
            <TickerWrapper>
              <TickerSymbol>{tickerSymbol}</TickerSymbol>
            </TickerWrapper>
          </Box>
          <Box>
            <InputAmount id="ip-amount" type="number" min={0} max={maxCollVal} sx={collAmount && collAmount > 0 ? { color: '#fff' } : { color: '#adadad' }} placeholder="0.00" value={collAmount ? Number(collAmount).toString() : 0} onChange={onChangeAmount} />
            <DollarAmount>{(collAmountDollarPrice && collAmountDollarPrice > 0) ? ('$' + collAmountDollarPrice?.toLocaleString()) : ''}</DollarAmount>
          </Box>
        </FormStack>
        <BottomBox>
          Current dept:
          {
            editType === 0 ?
              <BottomValue>{currentCollAmount.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}</BottomValue>
              :
              <BottomValuePointer onClick={() => onMax(currentCollAmount)}>{currentCollAmount.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}</BottomValuePointer>
          }
          <BottomDollarValue>{dollarPrice && '($' + dollarPrice.toLocaleString() + ')'}</BottomDollarValue>
        </BottomBox>
      </CenterBox>
    </FormControl>
  )
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 54px;
	padding: 9px 21px 8px 24px;
  border-bottom: solid 1px #444444;
  border-top-right-radius: 10px;
	background-color: #333333;
  &:hover {
    box-shadow: 0 0 0 1px #809cff inset;
  }
`

const UpperTabBox = styled(Box)`
  padding-top: 5px; 
  border-top-left-radius: 10px; 
  border-top-right-radius: 10px; 
  background: #252627; 
  border: 1px solid #444;
`

const HeaderTitle = styled(Box)`
  display: flex; 
  align-items: flex-end; 
  font-size: 12px; 
  font-weight: 500; 
  color: #949494; 
  margin-right: 15px;
`

const MaxPointerValue = styled('span')`
  font-size: 13px; 
  color: #90e4fe; 
  margin-left: 4px;
  cursor: pointer;
`

const BalanceValue = styled('span')`
  font-size: 13px; 
  margin-left: 5px; 
  color: #e9d100;
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
	background-color: #333333;
	font-size: 16px;
	font-weight: 500;
	color: #adadad;
`

const DollarAmount = styled('div')`
  font-size: 10px; 
  text-align: right; 
  color: #b9b9b9; 
  margin-right: 18px;
`

const CenterBox = styled(Box)`
  border-bottom-left-radius: 10px; 
  border-top-right-radius: 10px; 
  border-bottom-right-radius: 10px; 
  border: 1px solid #444444;
`

const BottomBox = styled(Box)`
  background: #252627;
  font-size: 11px;
  font-weight: 500;
  color: #949494;
  text-align: center;
  height: 28px;
  padding-top: 6px;
  border-bottom-left-radius: 9px;
  border-bottom-right-radius: 9px;
`

const BottomValue = styled('span')`
  color: #fff; 
  margin-left: 4px;
`
const BottomValuePointer = styled('span')`
  color: #90e4fe; 
  cursor: pointer; 
  margin-left: 4px;
`
const BottomDollarValue = styled('span')`
  color: #fff; 
  margin-left: 5px;
`

export default EditBorrowedInput
