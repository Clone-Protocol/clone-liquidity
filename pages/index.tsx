import type { NextPage } from 'next'
import Head from 'next/head'
import { styled } from '@mui/system'
import { Container, Box, Stack } from '@mui/material'
import WelcomeMsg from '~/components/Overview/WelcomeMsg'
import LineChart from '~/containers/Overview/LineChart'
import BarChart from '~/containers/Overview/BarChart'
import AssetList from '~/containers/Overview/AssetList'

const Overview: NextPage = () => {
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
              <Stack direction="row" spacing={2} sx={{ marginBottom: '19px' }}>
                <LineChart />
                <BarChart />
              </Stack>
							<AssetList />
						</Box>
					</Container>
				</StyledSection>
			</main>
		</div>
	)
}

export const StyledSection = styled('section')`
	${(props) => props.theme.breakpoints.up('md')} {
		padding-top: 100px;
	}
	${(props) => props.theme.breakpoints.down('md')} {
		padding: 50px 0px;
	}
`

export default Overview
