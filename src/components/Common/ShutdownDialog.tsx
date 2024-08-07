import React from 'react'
import { Box, Dialog, DialogContent, Typography, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { FadeTransition } from '~/components/Common/Dialog'
import { CloseButton } from './CommonButtons'

const ShutdownDialog = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
  return (
    <>
      <Dialog open={open} TransitionComponent={FadeTransition}>
        <DialogContent sx={{ backgroundColor: '#080018', width: '480px', padding: '23px', border: '1px solid #414166', borderRadius: '10px' }}>
          <BoxWrapper>
            <DateBox><Typography variant='p'>Aug 9th, 2024</Typography></DateBox>

            <Box width='400px' lineHeight={1} margin='0 auto' mt='15px'>
              <p>Dear Clone Community,</p>

              <p>We’re deeply disappointed to announce that Clone will be shutting down on September 30th, 2024. After three years of pioneering cross-chain and synthetic asset technology, this is a difficult decision.</p>

              <p>Effective immediately, the Markets app is no longer accessible. <span style={{ color: '#4fe5ff' }}>Please use the Liquidity app for the shutdown process.</span></p>

              <p>Your passion and support have been instrumental to our journey. Together, we’ve made significant strides in decentralized finance. We’re incredibly proud of what we’ve accomplished.</p>

              <p>We understand this news is unexpected and want to ensure a smooth transition. For detailed instructions on LP collateral withdrawal and clAsset holder procedures, please visit <a href='https://docs.clone.so' target='_blank' rel='noreferrer'><span style={{ color: '#4fe5ff', textDecoration: 'underline' }}>our docs page.</span></a></p>

              <p>Stay connected through our Twitter/X and Discord for the latest updates and to continue engaging with the Clone community.</p>

              <p>Thank you for being part of the Clone family.</p>

              <p>
                Sincerely,
                <br />The Clone Team
              </p>
            </Box>

            <ProceedButton display='flex' justifyContent='center' alignItems='center' margin='0 auto' mt='30px' onClick={handleClose}>
              <Typography variant='p'>Open Liquidity App</Typography>
            </ProceedButton>
            <Box sx={{ position: 'absolute', right: '10px', top: '10px' }}>
              <CloseButton handleClose={handleClose} />
            </Box>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}

const DateBox = styled(Box)`
  width: 126px;
  height: 26px;
  margin: 0 auto;
  text-align: center;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.11);
`
const BoxWrapper = styled(Box)`
  padding: 20px; 
  color: #fff; 
  width: 100%;
  font-size: 14px;
  overflow: hidden;
`
const ProceedButton = styled(Box)`
  width: 139px;
  height: 30px;
  cursor: pointer;
  border-radius: 5px;
  border: solid 1px #4fe5ff;
  background-color: #4fe5ff;
  color: #000;
`

export default ShutdownDialog

