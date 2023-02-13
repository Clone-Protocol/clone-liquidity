import React from 'react'
import { Box, styled, Dialog, DialogContent, Divider, Typography } from '@mui/material'
import { SliderTransition } from '~/components/Common/Dialog'
import GridLiquidityPool from './GridLiquidityPool'

const ChooseLiquidityPoolsDialog = ({ open, noFilter, handleChoosePool, handleClose }: { open: boolean, noFilter: boolean, handleChoosePool: (id: number) => void, handleClose: () => void }) => {
  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={792}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b', padding: '15px 15px' }}>
          <BoxWrapper>
            <Box><Typography variant='h7'>Liquidity Pools</Typography></Box>
            <StyledDivider />
            <GridLiquidityPool onChoose={handleChoosePool} noFilter={noFilter} />
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}


const BoxWrapper = styled(Box)`
  padding: 2px 15px; 
  color: #fff; 
  min-width: 792px;
`
const StyledDivider = styled(Divider)`
	background-color: ${(props) => props.theme.boxes.blackShade};
	margin-bottom: 21px;
	margin-top: 21px;
	height: 1px;
`

export default ChooseLiquidityPoolsDialog

