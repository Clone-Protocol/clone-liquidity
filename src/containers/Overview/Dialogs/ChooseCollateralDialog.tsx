//@DEPRECATED
import React from 'react'
import { Box, styled, Dialog, DialogContent, Typography } from '@mui/material'
import { FadeTransition } from '~/components/Common/Dialog'
import GridCollateral from './GridCollateral'

const ChooseCollateralDialog = ({ open, handleChooseCollateral, handleClose }: { open: boolean, handleChooseCollateral: (id: number) => void, handleClose: () => void }) => {
  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={560}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b', padding: '10px 15px' }}>
          <BoxWrapper>
            <Box><Typography variant='p'>Available Collateral</Typography></Box>
            <GridCollateral onChoose={handleChooseCollateral} />
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}

const BoxWrapper = styled(Box)`
  padding: 8px 15px; 
  color: #fff; 
  min-width: 560px;
`

export default ChooseCollateralDialog

