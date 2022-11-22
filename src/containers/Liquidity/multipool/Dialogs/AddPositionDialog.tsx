import React, { useState } from 'react'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { Box, styled, Dialog, DialogContent} from '@mui/material'
import { SliderTransition } from '~/components/Common/Dialog'
import GridLiquidityPool from './GridLiquidityPool'

const AddPositionDialog = ({ open, handleChoosePosition, handleClose }:  { open: any, handleChoosePosition: any, handleClose: any }) => {
  const [loading, setLoading] = useState(false)
  
  return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={800}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '20px 15px' }}>
          <Box sx={{ padding: '8px 28px', color: '#fff', minWidth: '650px' }}>
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
  color: #fff;
`

const Divider = styled('div')`
  width: 100%;
  height: 1px;
  margin-top: 17px;
  margin-bottom: 10px;
  background-color: #2c2c2c;
`

export default AddPositionDialog

