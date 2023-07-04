import type { NextPage } from 'next'
import Head from 'next/head'
import { styled } from '@mui/system'
import { Container, Box } from '@mui/material'
import WelcomeMsg from '~/components/Overview/WelcomeMsg'
import LineChart from '~/containers/Overview/LineChart'
import AssetList from '~/containers/Overview/AssetList'

const Overview: NextPage = () => {
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
						<WelcomeMsg />
						<Box marginTop='40px'>
							<Box marginBottom='19px'>
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

export const StyledSection = styled('section')`
	${(props) => props.theme.breakpoints.up('md')} {
		padding-top: 100px;
	}
	${(props) => props.theme.breakpoints.down('md')} {
		padding: 50px 0px;
	}
`

export default Overview
