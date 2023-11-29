'use client'
import { StyledSection } from '../page'
import { Container, Box, Typography, Stack } from '@mui/material'
import Image from 'next/image'
import LearnMoreIcon from 'public/images/learn-more.svg'
import MyPointStatus from '~/containers/Points/MyPointStatus'
import RankingList from '~/containers/Points/RankingList'

const Points = () => {

  return (
    <StyledSection>
      <Container>
        <Box px='20px'>
          <Box><Typography fontSize='20px' fontWeight={500}>Points</Typography></Box>
          <Stack direction='row' alignItems='center' gap={1}>
            <Typography variant='p' color='#66707e'>Earn points by participating in Clone ecosystem.</Typography>
            <Box display='flex' color='#b5fdf9' sx={{ cursor: 'pointer', ":hover": { color: '#4fe5ff' } }}>
              <Typography variant='p' mr='3px'>Learn more</Typography>
              <Image src={LearnMoreIcon} alt='learnMore' />
            </Box>
          </Stack>
          <Box mt='10px'>
            <MyPointStatus />

            <RankingList />
          </Box>
        </Box>
      </Container>
    </StyledSection>
  )
}

export default Points
