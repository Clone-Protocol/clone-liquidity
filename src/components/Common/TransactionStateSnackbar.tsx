import React from 'react'
import { Box, styled, Typography, Snackbar } from '@mui/material'
import SuccessIcon from 'public/images/check-mark-icon.svg'
import FailureIcon from 'public/images/failure-mark-icon.svg'
import CloseIcon from 'public/images/close.svg'
import Image from 'next/image'

const TransactionStateSnackbar = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
  return (
    <>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Box width='236px' textAlign='center'>
          <CloseButton><Image src={CloseIcon} /></CloseButton>
          <Image src={SuccessIcon} />
          <Box><Typography variant='h7'>Transaction complete</Typography></Box>
          <Box><Typography variant='p' color='#989898'>You can now access all features.</Typography></Box>
          <Box sx={{ textDecoration: 'underline' }}><a href='' target='_blank'><Typography variant='p' color='#258ded'>View Transaction</Typography></a></Box>
        </Box>
      </Snackbar>
    </>
  )
}

const CloseButton = styled(Box)`
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
`


export default TransactionStateSnackbar

