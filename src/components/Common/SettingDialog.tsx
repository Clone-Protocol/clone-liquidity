import React from 'react'
import { Box, styled, Dialog, DialogContent, Typography, Button } from '@mui/material'
import { FadeTransition } from '~/components/Common/Dialog'


const SettingDialog = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {

  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={238}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b', padding: '15px 35px' }}>
          <Box textAlign='center'>
            <Box><Typography variant='p_lg'>Please connect wallet</Typography></Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SettingDialog

