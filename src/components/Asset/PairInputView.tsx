import { FormControl, Input, InputAdornment, InputLabel, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'

interface Props {
  tickerIcon: string,
  tickerSymbol: string | null,
  value?: number
}

const PairInputView: React.FC<Props> = ({ tickerIcon, tickerSymbol, value }) => {
  
  return (
    <FormControl variant='standard' sx={{ width: '100%' }}>
      <FormStack direction="row" justifyContent="space-between" alignItems="center">
        <Box display="flex">
          <Image src={tickerIcon} width="28px" height="28px" />
          <Box sx={{ width: '100px', marginLeft: '8px', textAlign: 'left' }}>
            <TickerSymbol>{tickerSymbol}</TickerSymbol>
          </Box>
        </Box>
        <InputAmount
          id="ip-amount"
          type='number'
          disabled
          defaultValue={value}
          />
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
  border: solid 1px #5c5c5c;
  background-color: #171717;
`

const TickerSymbol = styled('div')`
  font-size: 15px;
  font-weight: 600;
  color: #5c5c5c;
`

const InputAmount = styled(`input`)`
  width: 330px;
  margin-left: 30px;
  text-align: right;
  border: 0px;
  background-color: #171717;
  font-size: 18px;
  font-weight: 600;
  color: #5c5c5c;
`

export default PairInputView
