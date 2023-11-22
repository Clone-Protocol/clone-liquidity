'use client'
import { StyledSection } from '../page'
import { Container, Box, Typography } from '@mui/material'

const Points = () => {

  return (
    <StyledSection>
      <Container>
        <Box px='20px'>
          <Box ml='18px'><Typography fontSize='20px' fontWeight={500}>Points</Typography></Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>

          </Box>
        </Box>
      </Container>
    </StyledSection>
  )
}

export default Points
