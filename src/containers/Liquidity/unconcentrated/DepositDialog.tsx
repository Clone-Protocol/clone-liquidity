import React, { useState } from 'react'
import { Box, Stack, Divider, styled, Button, Dialog, DialogContent } from '@mui/material'
import PairInput from '~/components/Borrow/PairInput'
import ethLogo from '../../../../public/images/assets/ethereum-eth-logo.svg'

const DepositDialog = ({ open, handleClose }: any) => {
  const [fromAmount, setFromAmount] = useState(0.0)
  const [toAmount, setToAmount] = useState(0.0)

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent sx={{ backgroundColor: '#171717', border: 'solid 1px #535353'}}>
        <Box sx={{ padding: '30px', color: '#fff' }}>
          <Box>
            <SubTitle>(1) Provide additional iSOL to deposit</SubTitle>
            <SubTitleComment>Acquire iSOL by Borrowing</SubTitleComment>
            <PairInput tickerIcon={ethLogo} tickerName="USD Coin" tickerSymbol="USDC" value={fromAmount} />
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>(2) Provide additional USDi to deposit</SubTitle>
            <SubTitleComment>Equivalent value of USDi must be provided</SubTitleComment>
            <PairInput tickerIcon={ethLogo} tickerName="Incept USD" tickerSymbol="USDi" value={toAmount} />
          </Box>
          <StyledDivider />
          <ActionButton onClick={handleClose}>Deposit</ActionButton>
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

const SubTitleComment = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #989898;
  marginBottom: 18px;
`

const ActionButton = styled(Button)`
  width: 100%;
  background: #7d7d7d;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
`

export default DepositDialog