import { FormControl, styled, Stack, Box, Typography } from '@mui/material'
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
        <StyledTabs value={editType} onChange={onChangeType}>
          <StyledTab value={0} label="Borrow more"></StyledTab>
          <StyledTab value={1} label="Repay"></StyledTab>
        </StyledTabs>
        <HeaderTitle>
          {
            editType === 0 ?
              <span>
                <Typography variant='p'>Max Borrow-able: </Typography>
                <MaxPointerValue onClick={() => onMax(maxCollVal)}>{maxCollVal.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}</MaxPointerValue>
              </span>
              :
              <span>
                <Typography variant='p'>Wallet Balance: </Typography>
                <Typography variant='p'>{maxCollVal.toLocaleString(undefined, { maximumFractionDigits: 5 })}</Typography>
              </span>
          }
        </HeaderTitle>
      </Stack>
      <CenterBox>
        <FormStack direction="row" justifyContent="space-between" alignItems="center">
          <Box display="flex">
            <Image src={tickerIcon} width="28px" height="28px" />
            <Box ml='10px'>
              <Typography variant='p_lg'>{tickerSymbol}</Typography>
            </Box>
          </Box>
          <Box>
            <InputAmount id="ip-amount" type="number" min={0} max={maxCollVal} sx={collAmount && collAmount > 0 ? { color: '#fff' } : { color: '#adadad' }} placeholder="0.00" value={collAmount ? Number(collAmount).toString() : 0} onChange={onChangeAmount} />
            <DollarAmount>{(collAmountDollarPrice && collAmountDollarPrice > 0) ? ('$' + collAmountDollarPrice?.toLocaleString() + ' USD') : ''}</DollarAmount>
          </Box>
        </FormStack>
      </CenterBox>
      <BottomBox>
        <Typography variant='p' color='#989898'>Current Dept: </Typography>
        {
          editType === 0 ?
            <span>
              <Typography variant='p'>{currentCollAmount.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}</Typography>
              <Typography variant='p' ml='3px'>{dollarPrice && '($' + dollarPrice.toLocaleString() + ')'}</Typography>
            </span>
            :
            <MaxPointerValue onClick={() => onMax(currentCollAmount)}>
              <Typography variant='p'>{currentCollAmount.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tickerSymbol}</Typography>
              <Typography variant='p' ml='3px'>{dollarPrice && '($' + dollarPrice.toLocaleString() + ')'}</Typography>
            </MaxPointerValue>
        }
      </BottomBox>
    </FormControl>
  )
}

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 54px;
	padding: 18px 12px;
  &:hover {
    box-shadow: 0 0 0 1px ${(props) => props.theme.palette.text.secondary} inset;
  }
`
const HeaderTitle = styled(Box)`
  display: flex; 
  align-items: flex-end; 
  font-size: 12px; 
  font-weight: 500;
  color: ${(props) => props.theme.palette.text.secondary};
  margin-right: 15px;
`
const MaxPointerValue = styled('span')`
  color: #90e4fe; 
  cursor: pointer;
`
const InputAmount = styled(`input`)`
  width: 230px;
  margin-left: 30px;
  text-align: right;
  border: 0px;
  background-color: #333333;
  font-size: 17.3px;
  font-weight: 500;
  color: #fff;
`
const DollarAmount = styled('div')`
  font-size: 12px; 
  font-weight: 500;
  text-align: right; 
  color: ${(props) => props.theme.palette.text.secondary};
  margin-right: 2px;
`
const CenterBox = styled(Box)`
  background-color: ${(props) => props.theme.boxes.blackShade};
`
const BottomBox = styled(Box)`
  text-align: center;
  height: 30px;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`

export default EditBorrowedInput
