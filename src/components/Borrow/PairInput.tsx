import { FormControl, Input, InputAdornment, InputLabel, styled, Stack, Box } from '@mui/material'
import Image from 'next/image'

interface Props {
  title: string | null,
  tickerIcon: string,
  tickerName: string | null,
  tickerSymbol: string | null,
  value?: number,
  onChange?: () => void
}

const PairInput: React.FC<Props> = ({ title, tickerIcon, tickerName, tickerSymbol, value, onChange }) => {
  
  return (
    <FormControl variant='standard'>
      <Stack direction="row" justifyContent="flex-end">
        <Box sx={{ fontSize: '12px', fontWeight: '500' }}>Balance: _</Box>
      </Stack>
      <FormStack direction="row" justifyContent="space-between" alignItems="center">
        <Box display="flex">
          <Image src={tickerIcon} width="28px" height="28px" />
          <Box sx={{ width: '100px', marginLeft: '8px', textAlign: 'left' }}>
            <TickerSymbol>{tickerSymbol}</TickerSymbol>
            <TickerName>{tickerName}</TickerName>
          </Box>
        </Box>
        <InputAmount
          id="ip-amount"
          type='number'
          value={value}
          onChange={onChange}
          />
      </FormStack>
    </FormControl>
  )
}

const FormStack = styled(Stack)`
  display: flex;
  width: 100%;
  height: 65px;
  padding: 15px 25px 14px 34px;
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
  color: #757a7f;
`

export default PairInput
