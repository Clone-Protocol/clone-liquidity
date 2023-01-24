import type { NextPage } from 'next'
import Head from 'next/head'
import { StyledSection } from 'pages'
import { Container, Box, Divider } from '@mui/material'
import WelcomeMsg from '~/components/Overview/WelcomeMsg'
import MyStatus from '~/containers/Liquidity/MyStatus'
import LiquidityTable from '~/containers/Liquidity/LiquidityTable'

const MyLiquidity: NextPage = () => {

	return (
		<div>
			<Head>
				<title>My Liquidity - Incept Liquidity Protocol</title>
				<meta name="description" content="My Liquidity - Incept Liquidity Protocol" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				<StyledSection>
					<Container>
						<WelcomeMsg />
						<Box marginTop='40px'>
							<MyStatus />
							<Divider sx={{ backgroundColor: '#3f3f3f' }} />
							<LiquidityTable />
						</Box>
					</Container>
				</StyledSection>
			</main>
		</div>
	)
}

export default MyLiquidity
