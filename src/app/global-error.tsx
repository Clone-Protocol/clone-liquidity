'use client'
import { styled } from '@mui/system'
import { Container, Stack, Typography } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <StyledSection>
      <Container>
        <Stack direction='row' justifyContent='center' alignItems='center' spacing={2} border='1px solid #3a3a3a' marginTop='200px' padding='20px'>
          <WarningAmberIcon /> <Typography variant="p_lg">{`We're sorry, but we're experiencing technical difficulties at the moment. Our team is working to fix the issue. We apologize for any inconvenience caused.`}</Typography>
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