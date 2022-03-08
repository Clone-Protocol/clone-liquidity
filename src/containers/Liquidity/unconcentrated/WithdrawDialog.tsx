import React, { useState } from 'react'
import { Box, Stack, Divider, styled, Button, Dialog, DialogContent } from '@mui/material'
import RatioSlider from '~/components/Borrow/RatioSlider'

const WithdrawDialog = ({ open, handleClose }: any) => {
  const [amount, setAmount] = useState(50)
  const [value, setValue] = useState(0.0)

  const handleChangeAmount = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setAmount(newValue)
    }
  }

  const onChange = () => {

  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent sx={{ backgroundColor: '#171717', border: 'solid 1px #535353'}}>
        <Box sx={{ padding: '30px', color: '#fff' }}>
          <Box>
            <SubTitle>Select withdrawal amount</SubTitle>
            <InputAmount
              id="ip-amount"
              type='number'
              value={value}
              onChange={onChange}
              />
            <RatioSlider value={amount} onChange={handleChangeAmount} />
          </Box>
          <StyledDivider />

          <ActionButton onClick={handleClose}>Withdraw</ActionButton>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

const StyledDivider = styled(Divider)`
  background-color: #535353;
  margin-bottom: 39px;
  margin-top: 39px;
  height: 1px;
`

const SubTitle = styled('div')`
  font-size: 18px;
  font-weight: 500;
  marginBottom: 17px;
  color: #fff;
`

const InputAmount = styled(`input`)`
  width: 100%;
  height: 60px;
  text-align: right;
  border: 0px;
  background-color: #333333;
  font-size: 20px;
  font-weight: 500;
  color: #757a7f;
  margin-top: 20px;
  margin-bottom: 20px;
`

const ActionButton = styled(Button)`
  width: 100%;
  background: #7d7d7d;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
`

export default WithdrawDialog