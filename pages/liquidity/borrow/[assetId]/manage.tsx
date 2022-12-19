import type { NextPage } from 'next'
import Head from 'next/head'
import { StyledSection } from 'pages'
import { useRouter } from 'next/router'
import { Container, Box } from '@mui/material'
import ManageBorrow from '~/containers/Liquidity/borrow/ManageBorrow'

const Manage: NextPage = () => {
	const router = useRouter()
	const { assetId } = router.query

	return (
		<div>
			<Head>
				<title>Manage - Incept Liquidity Protocol</title>
				<meta name="description" content="Incept Liquidity Protocol" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				<StyledSection>
					<Container>
						<Box sx={{ marginTop: '40px', marginLeft: '24px' }}>
							<ManageBorrow assetId={assetId} />
						</Box>
					</Container>
				</StyledSection>
			</main>
		</div>
	)
}

export default Manage
