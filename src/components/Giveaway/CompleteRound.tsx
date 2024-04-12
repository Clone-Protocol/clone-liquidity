import { Box, Stack, Theme, Typography, useMediaQuery } from "@mui/material"
import { styled } from "@mui/system"
import Image from "next/image"
import ArrowLink from 'public/images/giveaway/arrow-link.svg'
import ArrowLinkOn from 'public/images/giveaway/arrow-link-on.svg'
import { useState } from "react"

const CompleteRound = () => {
  const isMobileOnSize = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const [hoverArrow, setHoverArrow] = useState(false)

  return (
    <Stack direction='row' justifyContent='center' alignItems='center' width='100%' mt='23px' mb='10px'>
      <BorderBox width={isMobileOnSize ? '100%' : '474px'} height='104px' position='relative'>
        <Box display='flex' justifyContent='center' alignItems='center'>
          <Typography variant='p_xlg' fontWeight={500}>Round 1 draw is now complete</Typography>
        </Box>
        <Box display='flex' justifyContent='center' alignItems='center'>
          <Typography variant='p' fontWeight={500} color='#c5c7d9'>
            Prize points have been applied and click this box to see the winners!
          </Typography>
        </Box>
        <a href="https://docs.clone.so/clone-mainnet-guide/points-program/season-1/cloner-classic-giveaway#past-ccg-winners" target='_blank'>
          <Box position='absolute' top='10px' right='10px' onMouseEnter={() => setHoverArrow(true)} onMouseLeave={() => setHoverArrow(false)}>
            <Image src={hoverArrow ? ArrowLinkOn : ArrowLink} alt='ArrowLink' />
          </Box>
        </a>
      </BorderBox>
    </Stack>
  )
}

const BorderBox = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  border-radius: 10px;
  border-style: solid;
  border-width: 1px;
  border-image-source: linear-gradient(103deg, #a18e3f -19%, #7336a2 102%);
  border-image-slice: 1;
  background-image: linear-gradient(to bottom, #000, #000), linear-gradient(103deg, #a18e3f -19%, #7336a2 102%);
  background-origin: border-box;
  background-clip: content-box, border-box;
`

export default CompleteRound