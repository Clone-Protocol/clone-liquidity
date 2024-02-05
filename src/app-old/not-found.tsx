'use client'
import { styled } from '@mui/system'
import { Container, Typography, Box, Button } from '@mui/material'
import Image from 'next/image'
import logoIcon from 'public/images/logo-liquidity.svg'

const NotFound = () => {
  return (
    <StyledSection>
      <Container>
        <Box mt='150px' textAlign='center'>
          <Box mb='10px'>
            <Image src={logoIcon} width={100} height={26} alt="clone" />
          </Box>
          <Box mb='30px' lineHeight={0.8}>
            <Typography fontSize='70px' fontWeight={600} color='#4fe5ff'>404</Typography>
            <Typography variant='p_lg' fontWeight={600}>Page not found</Typography>
          </Box>
          <a href='/'><ReturnButton><Typography variant='p_lg'>Return Home</Typography></ReturnButton></a>
        </Box>
      </Container>
    </StyledSection>
  )
}

const StyledSection = styled('section')`
  max-width: 1085px;
  margin: 0 auto;
  color: #fff;
  ${(props) => props.theme.breakpoints.up('md')} {
    padding-top: 100px;
	}
  ${(props) => props.theme.breakpoints.down('md')} {
    padding: 50px 0px;
	}
`

const ReturnButton = styled(Button)`
  width: 162px;
  height: 42px;
  border-radius: 5px;
  box-shadow: 0 0 15px 0 #005874;
  border: solid 1px #4fe5ff;
  background-color: #000;
  color: #fff;
  &:hover {
    border: solid 1px #24abc2;
    background-color: #000;
  }
`

export default NotFound