import type { NextPage } from 'next'
import Head from 'next/head'
import { styled } from '@mui/system'
import { Container, Box } from '@mui/material'
import BorrowBox from '~/containers/Borrow/BorrowBox'

const Borrow: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Borrow - Incept Liquidity Protocol</title>
        <meta name="description" content="Incept Liquidity Protocol" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <StyledSection>
          <Container>
            <Box sx={{ marginTop: '40px' }}>
              <BorrowBox />
            </Box>
          </Container>
        </StyledSection>
      </main>
    </div>
  )
}

const StyledSection = styled('section')`
	${(props) => props.theme.breakpoints.up('md')} {
		padding-top: 100px;
	}
	${(props) => props.theme.breakpoints.down('md')} {
		padding: 50px 0px;
	}
`

export default Borrow
