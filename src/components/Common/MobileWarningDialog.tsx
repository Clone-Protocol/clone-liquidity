import React from 'react'
import { Box, styled, Dialog, DialogContent, Typography, Button } from '@mui/material'
import { FadeTransition } from '~/components/Common/Dialog'
import { StyledDivider } from './StyledDivider'
import Image from 'next/image'
import OctagonIcon from 'public/images/alert-octagon-outline.svg'
import HomeIcon from 'public/images/mobile/home.svg'
import TwitterIcon from 'public/images/mobile/twitter.svg'
import DiscordIcon from 'public/images/mobile/discord.svg'
import { Stack } from '@mui/system'
import { MARKETS_APP, DISCORD_URL, OFFICIAL_WEB, TWITTER_URL } from '~/data/social'

const MobileWarningDialog = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
  return (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={425}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b', padding: '15px' }}>
          <BoxWrapper>
            <Image src={OctagonIcon} width="55px" height="55px" />

            <Box maxWidth='280px' lineHeight={1} margin='0 auto' mt='15px'><Typography variant='p_lg'>Unleash the power of Clone Liquidity App from larger screen</Typography></Box>
            <Box width='288px' lineHeight={1} margin='0 auto' my='20px'>
              <Typography variant='p' color='#989898'>
                Clone Liquidity App is packed with advanced features that are not optimal for mobile and tablet environments with smaller screens. Please access the app from your Desktop or Laptop with larger screens for the best experience.
              </Typography>
            </Box>
            {/* <StyledDivider />
            <Box><Typography variant='p_sm' color='#989898'>Mobile and Tablet compatible:</Typography></Box>
            <a href={MARKETS_APP} target="_blank" rel="noreferrer">
              <MarketButton><Typography variant='p'>Clone Markets App</Typography></MarketButton>
            </a> */}
            <Stack direction='row' justifyContent='center' gap={2}>
              <a href={OFFICIAL_WEB} target="_blank" rel="noreferrer"><Image src={HomeIcon} /></a>
              <a href={TWITTER_URL} target="_blank" rel="noreferrer"><Image src={TwitterIcon} /></a>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer"><Image src={DiscordIcon} /></a>
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
  width: 425px;
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

