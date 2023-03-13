import React from 'react'
import { Box, styled, Dialog, DialogContent, Typography } from '@mui/material'
import { SliderTransition } from '~/components/Common/Dialog'
import GridAssets from './GridAssets'
import { StyledDivider } from '~/components/Common/StyledDivider'

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

export default ChooseAssetDialog

