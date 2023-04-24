import * as React from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { StyledSection } from 'pages'
import Container from '@mui/material/Container'
import AssetView from '~/containers/Overview/AssetView'
import { Box } from '@mui/material'

const AssetPage: NextPage = () => {
	const router = useRouter()
	const { assetId } = router.query

	return (
		<div>
			<Head>
				<title>Asset</title>
			</Head>
			<main>
				<StyledSection>
					<Container>
						<Box display='flex' justifyContent='center' mt="15px">
							<AssetView assetTicker={assetId} />
						</Box>
					</Container>
				</StyledSection>
			</main>
		</div>
	)
}

export default AssetPage
