import React, { useState } from 'react'
import { Box, Stack, Divider, styled, Button, Dialog, DialogContent } from '@mui/material'
import RatioSlider from '~/components/Borrow/RatioSlider'

const WithdrawDialog = ({ assetId, open, handleClose }: any) => {
  const [amount, setAmount] = useState(0.0)
  const [percent, setPercent] = useState(50)
  const [maxValue, setMaxValue] = useState(0.0)

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value) {
      const amt = parseFloat(e.currentTarget.value)
      setAmount(amt)
    }
  }

  const handleChangePercent = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setPercent(newValue)
    }
  }

  const onWithdraw = () => {
    handleClose()

    console.log(amount)
    console.log(percent)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent sx={{ width: '570px', backgroundColor: '#171717', border: 'solid 1px #535353'}}>
        <Box sx={{ padding: '30px', color: '#fff' }}>
          <Box>
            <SubTitle>Select withdrawal amount</SubTitle>
            <Stack direction="row" justifyContent="flex-end">
              <Box sx={{ fontSize: '13px', fontWeight: '500' }}>Max value: {maxValue}</Box>
            </Stack>
            <InputAmount
              id="ip-amount"
              type='number'
              value={amount}
              onChange={handleChangeAmount}
              />
            <RatioSlider min={0} max={100} value={percent} onChange={handleChangePercent} />
          </Box>
          <StyledDivider />

          <ActionButton onClick={onWithdraw}>Withdraw</ActionButton>
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
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  margin-top: 5px;
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