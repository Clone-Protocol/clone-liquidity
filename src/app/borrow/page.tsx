'use client'
import { StyledSection } from '../page'
import { Container, Box, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { GoBackButton } from '~/components/Common/CommonButtons'
import BorrowContainer from '~/containers/Borrow/BorrowContainer'

const Borrow = () => {
  const router = useRouter()

  return (
    <StyledSection>
      <Container>
        <Box p='20px'>
          <GoBackButton onClick={() => router.back()} ml='16px'><Typography variant='p'>{'<'} Go back</Typography></GoBackButton>
          <Box ml='16px'><Typography fontSize='20px' fontWeight={500}>New Borrow Position</Typography></Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <BorrowContainer />
          </Box>
        </Box>
      </Container>
    </StyledSection>
  )
}

export default Borrow
