import React from 'react'
import { Box, styled, Dialog, DialogContent, Typography, Divider } from '@mui/material'
import { SliderTransition } from '~/components/Common/Dialog'
import GridAssets from './GridAssets'

const ChooseAssetDialog = ({ open, handleChooseAsset, handleClose }: { open: boolean, handleChooseAsset: (id: number) => void, handleClose: () => void }) => {
  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={560}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '10px 15px' }}>
          <BoxWrapper>
            <Box><Typography variant='h7'>iAssets</Typography></Box>
            <StyledDivider />
            <GridAssets onChoose={handleChooseAsset} />
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
const StyledDivider = styled(Divider)`
	background-color: ${(props) => props.theme.boxes.blackShade};
	margin-bottom: 11px;
	margin-top: 11px;
	height: 1px;
`

export default ChooseAssetDialog

