import { NextPage } from "next"
import { styled } from '@mui/system'
import Head from 'next/head'
import { Container, Stack, Typography } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const Custom404: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Clone Liquidity - Home of the Comet Liquidity System</title>
        <meta name="description" content="Clone Liquidity enables users to try our pioneering leveraged liquidity system, presenting unique and flexible opportunities for liquidity providers to yield." />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main>
        <StyledSection>
          <Container>
            <Stack direction='row' justifyContent='center' alignItems='center' spacing={2} border='1px solid #3a3a3a' marginTop='200px' padding='20px'>
              <WarningAmberIcon /> <Typography variant="p">{`Oops! It seems like you've taken a wrong turn.`}</Typography>
            </Stack>
          </Container>
        </StyledSection>
      </main>
    </div>
  )
}

const StyledSection = styled('section')`
	max-width: 1085px;
	margin: 0 auto;
	${(props) => props.theme.breakpoints.up('md')} {
		padding-top: 100px;
	}
	${(props) => props.theme.breakpoints.down('md')} {
		padding: 50px 0px;
	}
`

export default Custom404