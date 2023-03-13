import React from 'react'
import { Box, styled, Dialog, DialogContent, Typography } from '@mui/material'
import { SliderTransition } from '~/components/Common/Dialog'
import GridCollateral from './GridCollateral'
import { StyledDivider } from '~/components/Common/StyledDivider'

const ChooseCollateralDialog = ({ open, handleChooseCollateral, handleClose }: { open: boolean, handleChooseCollateral: (id: number) => void, handleClose: () => void }) => {
  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={560}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '10px 15px' }}>
          <BoxWrapper>
            <Box><Typography variant='h7'>Available Collateral</Typography></Box>
            <StyledDivider />
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

