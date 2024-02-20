import React from 'react'
import { Box, Stack, Theme, Typography, useMediaQuery } from '@mui/material'
import { styled } from '@mui/material/styles'
import MarketsIcon from 'public/images/logo-markets.svg'
import CloseIcon from 'public/images/close-round.svg'
import Image from 'next/image'
import { MARKETS_APP } from '~/data/social'

const BannerMarkets = ({ open, handleClose }: Props) => {
  const isMobileOnSize = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  return open ? (
    <Box zIndex={9999} position='absolute' right={isMobileOnSize ? '12px' : '36px'} bottom={isMobileOnSize ? '66px' : '36px'} sx={{ background: '#000' }}>
      <StackWrapper direction='row' alignItems='center'>
        <Box width='109px' height='100%' display='flex' justifyContent='center' alignItems='center' sx={{ background: '#000', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
          <Image src={MarketsIcon} alt='liquidity' width={82} height={22} />
        </Box>
        <Box width='218px' padding='15px'>
          <Box mb='2px'><Typography variant='p' color='#fff'>Clone Markets app</Typography></Box>
          <Box lineHeight={0.8}><Typography variant='p_sm' color='#cacaca'>Use the Clone Markets app for trading any clAssets on Clone</Typography></Box>
          <a href={MARKETS_APP}><Box><Typography variant='p' color='rgba(191, 174, 255, 1)'>Try the app</Typography></Box></a>
        </Box>
        <CloseButton onClick={handleClose}><Image src={CloseIcon} alt='close' /></CloseButton>
      </StackWrapper>
    </Box>
  ) : <></>
}

export default BannerMarkets

interface Props {
  open: boolean
  handleClose: () => void
}
const StackWrapper = styled(Stack)`
  position: relative;
  width: 327px;
  height: 92px;
  border-radius: 10px;
  border: solid 1px #2e2e2e;
  background-color: rgba(255, 255, 255, 0.1);
`
const CloseButton = styled(Box)`
  position: absolute;
  right: 8px;
  top: 8px;
  cursor: pointer;
`