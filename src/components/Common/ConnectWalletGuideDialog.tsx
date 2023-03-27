import React from 'react'
import { Box, styled, Dialog, DialogContent, Typography, Button } from '@mui/material'
import { FadeTransition } from '~/components/Common/Dialog'
import Image from 'next/image'
import WalletIcon from 'public/images/wallet-icon.svg'

const ConnectWalletGuideDialog = ({ open, connectWallet, handleClose }: { open: boolean, connectWallet: () => void, handleClose: () => void }) => {
  const handleConnect = () => {
    connectWallet()
    handleClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={238}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b', padding: '15px 35px' }}>
          <Box textAlign='center'>
            <Box><Typography variant='p_lg'>Please connect wallet</Typography></Box>
            <ConnectButton onClick={handleConnect}><Image src={WalletIcon} alt="wallet" /><Typography variant='p' sx={{ marginLeft: '8px' }}>Connect Wallet</Typography></ConnectButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

const ConnectButton = styled(Button)`
  width: 140px;
  height: 36px;
  color: #fff;
  margin-top: 15px;
  padding: 9px 16px;
  background-color: #242424;
  border: solid 1px #258ded;
  &:hover {
    background-color: #2d2d2d;
  }
`

export default ConnectWalletGuideDialog

