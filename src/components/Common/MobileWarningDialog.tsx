import React from 'react'
import { Box, styled, Dialog, DialogContent, Typography } from '@mui/material'
import { FadeTransition } from '~/components/Common/Dialog'
import Image from 'next/image'
import OctagonIcon from 'public/images/alert-octagon-outline.svg'
import HomeIcon from 'public/images/mobile/home.svg'
import TwitterIcon from 'public/images/mobile/twitter.svg'
import DiscordIcon from 'public/images/mobile/discord.svg'
import { Stack } from '@mui/system'
import { DISCORD_URL, OFFICIAL_WEB, TWITTER_URL } from '~/data/social'

const MobileWarningDialog = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={324}>
        <DialogContent sx={{ backgroundColor: '#000e22;', border: '1px solid #414e66', borderRadius: '15px', padding: '15px', width: '324px' }}>
          <BoxWrapper>
            <Image src={OctagonIcon} width={55} height={55} alt='alert-octagon-outline' />

            <Box maxWidth='280px' lineHeight={1} margin='0 auto' mt='15px'><Typography variant='p_lg'>Unleash the power of Clone Liquidity beta app from larger screen</Typography></Box>
            <Box width='260px' lineHeight={1} margin='0 auto' my='20px'>
              <Typography variant='p' color='#989898'>
                Clone Liquidity Beta app contains advanced interface that is not available on smaller screens. Please enlarge your screen or visit us from a device with a larger screen. We apologize for any inconvenience!
              </Typography>
            </Box>
            {/* <StyledDivider />
            <Box><Typography variant='p_sm' color='#989898'>Mobile and Tablet compatible:</Typography></Box>
            <a href={MARKETS_APP} target="_blank" rel="noreferrer">
              <MarketButton><Typography variant='p'>Clone Markets App</Typography></MarketButton>
            </a> */}
            <Stack direction='row' justifyContent='center' gap={2}>
              <a href={OFFICIAL_WEB} target="_blank" rel="noreferrer"><Image src={HomeIcon} alt='home' /></a>
              <a href={TWITTER_URL} target="_blank" rel="noreferrer"><Image src={TwitterIcon} alt='twitter' /></a>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer"><Image src={DiscordIcon} alt='discord' /></a>
            </Stack>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}


const BoxWrapper = styled(Box)`
  padding: 20px; 
  color: #fff;
  text-align: center;
`
// const MarketButton = styled(Button)`
//   width: 195px;
//   height: 37px;
//   color: #fff;
//   margin-top: 15px;
//   margin-bottom: 28px;
//   border-radius: 20px;
//   border: solid 1px ${(props) => props.theme.palette.primary.main};
//   &:hover {
//     background-color: #2d2d2d;
//   }
// `

export default MobileWarningDialog

