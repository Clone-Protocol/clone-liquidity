/// @deprecated
import React from 'react'
import { Box, styled, Dialog, DialogContent } from '@mui/material'
import { FadeTransition } from '~/components/Common/Dialog'
import GridCollateral from './GridCollateral'

const ChooseCollateralDialog = ({ open, handleChooseCollateral, handleClose }: { open: boolean, handleChooseCollateral: (id: number) => void, handleClose: () => void }) => {
  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={360}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '10px 15px' }}>
          <BoxWrapper>
            <HeaderText>Choose Collateral</HeaderText>
            <Divider />
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
  min-width: 350px;
`
const HeaderText = styled(Box)`
  font-size: 11px;
  font-weight: 600;
  color: #fff9f9;
`
const Divider = styled('div')`
  width: 100%;
  height: 1px;
  margin-top: 10px;
  background-color: #535353;
`

export default ChooseCollateralDialog

