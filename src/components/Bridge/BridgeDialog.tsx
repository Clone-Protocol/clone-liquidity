import React, { useState } from 'react'
import { Box, Button, Dialog, DialogContent, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { FadeTransition } from '~/components/Common/Dialog'
import { CloseButton } from '../Common/CommonButtons'
import BridgeIcon from 'public/images/debug-step-over.svg'
import Image from 'next/image'
import PoweredByDebridge from 'public/images/powered_by_debridge.svg'
import DebridgeWidget from './DebridgeWidget'
import { DefaultWidget } from '~/utils/debridge_widgets'

const BridgeDialog = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
  const [isInitStep, setIsInitStep] = useState(true)

  const close = () => {
    setIsInitStep(true)
    handleClose()
  }

  return (
    <>
      <Dialog open={open} onClose={close} TransitionComponent={FadeTransition} maxWidth={463} sx={{ overflowX: 'hidden' }}>
        <DialogContent sx={{ backgroundColor: '#000916', borderRadius: '10px', paddingY: '15px', paddingX: '0px', height: isInitStep ? '500px' : '540px', overflowX: 'hidden', width: { xs: '100%', md: '340px' } }}>
          <BoxWrapper>
            <Box position='absolute' top='0px' width='100%' paddingTop='15px' zIndex={999} sx={{ backgroundColor: '#000916' }}>
              <Stack direction='row' justifyContent='space-between' >
                {isInitStep ?
                  <TitleBox ml='25px' mt='10px'><Typography variant='p_lg'>Bridge</Typography></TitleBox>
                  :
                  <Box></Box>
                  // <Box sx={{ cursor: 'pointer' }} ml='20px' mt='10px'>
                  //   <Image src={BackIcon} alt='back' onClick={() => setIsInitStep(true)} />
                  // </Box>
                }

                <Box mr='15px'>
                  <CloseButton handleClose={close} />
                </Box>
              </Stack>
            </Box>

            {isInitStep ?
              <>
                <Box mt='80px'><Image src={BridgeIcon} alt='icStatus' /></Box>

                <Box lineHeight={1} m='0 auto' my='12px' maxWidth='290px'>
                  <Typography variant='p_lg'>
                    Bridge your funds to Solana and fully utilize the power of Comet Liquidity System.
                  </Typography>
                </Box>

                <BridgeButton onClick={() => setIsInitStep(false)}><Typography variant='p_xlg'>Bridge now</Typography></BridgeButton>

                <Box mt='50px'><Image src={PoweredByDebridge} alt='powered_by_pyth' /></Box>
              </>
              :
              <Box mt='10px'>
                <DebridgeWidget widgetType={DefaultWidget} />
              </Box>
            }
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}


const BoxWrapper = styled(Box)`
  padding: 12px 0px; 
  color: #fff;
  text-align: center;
  overflow-x: hidden;
`
const TitleBox = styled(Box)`
  width: 100px;
  height: 36px;
  border-radius: 5px;
  border: solid 1px #b5fdf9;
  background-color: #071031;
  display: flex;
  align-items: center;
  justify-content: center;
`
const BridgeButton = styled(Button)`
  width: 213px;
  height: 44px;
  color: #000;
  margin-top: 12px;
  margin-bottom: 15px;
  border-radius: 10px;
  background-color: ${(props) => props.theme.palette.primary.main};
  &:hover {
    background: ${(props) => props.theme.basis.gloomyBlue};
  }
`
export default BridgeDialog

