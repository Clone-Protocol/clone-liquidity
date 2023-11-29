'use client'
import { StyledSection } from '../page'
import { Container, Box, Typography } from '@mui/material'

const Bridge = () => {

  return (
    <StyledSection>
      <Container>
        <Box px='20px'>
          <Box><Typography fontSize='20px' fontWeight={500}>Bridge</Typography></Box>
          <Box mt='10px'>
          </Box>
        </Box>
      </Container>
    </StyledSection>
  )
}

export default Bridge
