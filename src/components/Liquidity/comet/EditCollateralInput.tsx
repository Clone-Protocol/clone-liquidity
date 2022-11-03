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
  currentCollAmount?: number
  dollarPrice?: number
  onChangeType?: any
	onChangeAmount?: any
  onMax?: any
}

const EditCollateralInput: React.FC<Props> = ({
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
      <Stack sx={{ height: '40px' }} direction="row" justifyContent="space-between">
        <Box sx={{ paddingTop: '5px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', background: '#252627', border: '1px solid #444' }}>
          <StyledTabs value={editType} onChange={onChangeType}>
            <StyledTab value={0} label="Deposit"></StyledTab>
            <StyledTab value={1} label="Withdraw"></StyledTab>
          </StyledTabs>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', fontSize: '12px', fontWeight: '500' , color: '#949494', marginRight: '15px'}}>
          Max {editType === 0 ? 'depositable' : 'withdrawable'} : <span style={{ fontSize: '13px', color: '#90e4fe', marginLeft: '4px', cursor: 'pointer' }} onClick={() => onMax(maxCollVal)}>{maxCollVal.toLocaleString()} {tickerSymbol}</span>
        </Box>
      </Stack>
      <Box sx={{ borderBottomLeftRadius: '10px', borderTopRightRadius: '10px', borderBottomRightRadius: '10px', boxShadow: '0 0 0 1px #444444 inset' }}>
        <FormStack direction="row" justifyContent="space-between" alignItems="center">
          <Box display="flex">
            <Image src={tickerIcon} width="28px" height="28px" />
            <Box sx={{ width: '100px', marginLeft: '8px', textAlign: 'left' }}>
              <TickerSymbol>{tickerSymbol}</TickerSymbol>
            </Box>
          </Box>
          <Box>
            <InputAmount id="ip-amount" type="number" min={0} max={maxCollVal} sx={ collAmount && collAmount > 0 ? { color: '#fff' } : { color: '#adadad' }} placeholder="0.00" value={collAmount} onChange={onChangeAmount} />
            <div style={{ fontSize: '10px', textAlign: 'right', color: '#b9b9b9', marginRight: '18px'}}>{ (collAmountDollarPrice && collAmountDollarPrice > 0) ? ('$' + collAmountDollarPrice?.toLocaleString()) : '' }</div>
          </Box>
        </FormStack>
        <BottomBox>
          Current Collateral: <span style={{ color: '#fff' }}>{currentCollAmount?.toLocaleString()} {tickerSymbol} { dollarPrice && '($'+dollarPrice.toLocaleString() +')' }</span>
        </BottomBox>
      </Box>
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

export default EditCollateralInput
