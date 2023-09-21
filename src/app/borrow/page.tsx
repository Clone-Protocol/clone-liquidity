'use client'
import { StyledSection } from '../page'
import { Container, Box, Typography } from '@mui/material'
import BorrowContainer from '~/containers/Borrow/BorrowContainer'

const Borrow = () => {
  return (
    <StyledSection>
      <Container>
        <Box p='20px'>
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
