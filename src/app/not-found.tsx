'use client'
import { styled } from '@mui/system'
import { Container, Stack, Typography } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const NotFound = () => {
  return (
    <StyledSection>
      <Container>
        <Stack direction='row' justifyContent='center' alignItems='center' spacing={2} border='1px solid #3a3a3a' marginTop='200px' padding='20px'>
          <WarningAmberIcon /> <Typography variant="p_lg">{`Oops! It seems like you've taken a wrong turn.`}</Typography>
        </Stack>
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

export default NotFound