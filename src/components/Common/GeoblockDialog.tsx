import React from 'react'
import { Box, styled, Dialog, DialogContent, Typography, Button } from '@mui/material'
import { FadeTransition } from '~/components/Common/Dialog'
import { CloseButton } from './CommonButtons'

const GeoblockDialog = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={350}>
        <DialogContent sx={{ backgroundColor: '#000e22', border: '1px solid #414e66', borderRadius: '10px', padding: '15px', width: { xs: '100%', md: '350px' } }}>
          <BoxWrapper>
            <Box mb="21px"><Typography variant='p_xlg' fontWeight={500}>Restricted Territory</Typography></Box>

            <Box width='290px' lineHeight={1} my='20px'>
              <Typography variant='p'>
                You are accessing Clone Liquidity UI from a restricted territory. Unfortunately, this means you will not be allowed to connect your wallet and use Clone Protocol.
              </Typography>
            </Box>

            <Box><Typography variant='p'>More on </Typography><a href="#" target="_blank" rel="noreferrer"><Typography variant='p' color='#4fe5ff'>Clone Terms and Conditions.</Typography></a></Box>

            <Box sx={{ position: 'absolute', right: '10px', top: '10px' }}>
              <CloseButton handleClose={handleClose} />
            </Box>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}


const BoxWrapper = styled(Box)`
  padding: 10px 15px; 
  color: #fff;
`
export default GeoblockDialog

