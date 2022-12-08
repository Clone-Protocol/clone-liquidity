import React, { useState } from 'react'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { Box, styled, Dialog, DialogContent} from '@mui/material'
import { SliderTransition } from '~/components/Common/Dialog'
import GridCollateral from './GridCollateral'

const ChooseCollateralDialog = ({ open, handleChooseCollateral, handleClose }:  { open: any, handleChooseCollateral: (id: number) => void, handleClose: any }) => {
  const [loading, setLoading] = useState(false)
  
  return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={360}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '10px 15px' }}>
          <Box sx={{ padding: '8px 15px', color: '#fff', minWidth: '350px' }}>
            <HeaderText>Choose Collateral</HeaderText>
            <Divider />
            <GridCollateral onChoose={handleChooseCollateral} />
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

export default ChooseCollateralDialog

