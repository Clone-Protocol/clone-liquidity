import { styled } from '@mui/system'
import { Container, Stack, Typography } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import React from "react"

class ErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI

    return { hasError: true }
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can use your own error logging service here
    console.log({ error, errorInfo })
  }
  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
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

    // Return children components in case of no error

    return this.props.children
  }
}

export default ErrorBoundary

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