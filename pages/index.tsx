import type { NextPage } from 'next'
import Head from 'next/head'
import { styled } from '@mui/system'
import { Container, Box } from '@mui/material'
import dynamic from 'next/dynamic'
import WelcomeMsg from '~/components/Overview/WelcomeMsg'
import AssetList from '~/containers/Overview/AssetList'
// import LineChart from '~/components/Charts/LineChart'

const Overview: NextPage = () => {
  const LineChart = dynamic(() => import('~/components/Charts/LineChart'), { loading: () => <p>Loading ...</p>, ssr: false });

	return (
		<div>
			<Head>
				<title>Incept Liquidity Protocol</title>
				<meta name="description" content="Incept Liquidity Protocol" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				<StyledSection>
					<Container>
						<WelcomeMsg />
						<Box sx={{ marginTop: '40px' }}>
              <Box>
                <LineChart />
              </Box>

							<AssetList />
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

export default Overview
