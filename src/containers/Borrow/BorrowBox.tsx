import { Box, Stack, Button, Paper } from '@mui/material'
import React, { useState } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import PairInput from '~/components/Borrow/PairInput'
import ethLogo from '../../../public/images/assets/ethereum-eth-logo.svg'

const BorrowBox = () => {
  const [fromAmount, setFromAmount] = useState(0.0)
  const [toAmount, setToAmount] = useState(0.0)

  const onConfirm = () => {
  }

  return (
    <StyledPaper variant="outlined">
      <Box sx={{ fontSize: '24px', fontWeight: '600', marginBottom: '30px' }}>Borrow</Box>
      <Box>
        <Box>(1) Choose a collateral asset</Box>
        <PairInput title="Total" tickerIcon={ethLogo} tickerName="USD Coin" tickerSymbol="USDC" value={fromAmount} />
      </Box>
      <Box>
        <Box>(2) Set collateral ratio</Box>
        <PairInput title="Total" tickerIcon={ethLogo} tickerName="Incept USD" tickerSymbol="USDi" value={toAmount} />
      </Box>
      
      <ActionButton onClick={onConfirm}>Create Liquidity Position</ActionButton>
    </StyledPaper>
  )
}

const StyledPaper = styled(Paper)`
  width: 620px;
  font-size: 14px;
  font-weight: 500; 
  text-align: center;
  color: #fff;
  border-radius: 8px;
  text-align: left;
  background: #171717;
  padding-left: 53px;
  padding-top: 56px;
  padding-bottom: 42px;
  padding-right: 54px;
`

const ActionButton = styled(Button)`
  width: 100%;
  background: #7d7d7d;
  color: #fff;
  border-radius: 8px;
  margin-top: 38px;
  margin-bottom: 15px;
`

export default BorrowBox