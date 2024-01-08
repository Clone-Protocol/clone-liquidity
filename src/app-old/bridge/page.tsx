'use client'
import Image from 'next/image'
import { StyledSection } from '../page'
import LearnMoreIcon from 'public/images/learn-more.svg'
import { Container, Box, Typography, Stack } from '@mui/material'

const Bridge = () => {

  return (
    <StyledSection>
      <Container>
        <Box px='20px'>
          <Box><Typography fontSize='20px' fontWeight={500}>Bridge</Typography></Box>
          <Stack direction='row' alignItems='center' gap={1}>
            <Typography variant='p' color='#66707e'>Bridging is integral to Clone Protocol’s pioneering Hybrid Collateral Model.</Typography>
            <Box display='flex' color='#b5fdf9' sx={{ cursor: 'pointer', ":hover": { color: '#4fe5ff' } }}>
              <Typography variant='p' mr='3px'>Learn more</Typography>
              <Image src={LearnMoreIcon} alt='learnMore' />
            </Box>
          </Stack>
        </Box>
      </Container>
    </StyledSection>
  )
}

export default Bridge
