// @DEPRECATED
import type { NextPage } from 'next'
import Head from 'next/head'
import { StyledSection } from 'pages'
import { useRouter } from 'next/router'
import { Container, Box } from '@mui/material'
// import ManageComet from '~/containers/Liquidity/comet/ManageComet'

const Manage: NextPage = () => {
	const router = useRouter()
	const { assetId } = router.query

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
						<Box marginTop='40px' marginLeft='24px'>
							{/* <ManageComet assetId={assetId} /> */}
						</Box>
					</Container>
				</StyledSection>
			</main>
		</div>
	)
}

export default Manage
