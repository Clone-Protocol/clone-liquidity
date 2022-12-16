import React from 'react'
import { Box, styled, Dialog, DialogContent} from '@mui/material'
import { SliderTransition } from '~/components/Common/Dialog'
import GridLiquidityPool from './GridLiquidityPool'

const AddPositionDialog = ({ open, handleChoosePosition, handleClose }:  { open: boolean, handleChoosePosition: (id: number) => void, handleClose: any }) => {
  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={800}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '15px 15px' }}>
          <Box sx={{ padding: '2px 15px', color: '#fff', minWidth: '650px' }}>
            <HeaderText>Choose Liquidity Pool</HeaderText>
            <Divider />
            <GridLiquidityPool onChoose={handleChoosePosition} />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

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

export default AddPositionDialog

