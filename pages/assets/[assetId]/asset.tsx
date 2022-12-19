import * as React from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { styled } from '@mui/system'
import { StyledSection } from 'pages'
import Container from '@mui/material/Container'
import TipMsg from '~/components/Common/TipMsg'
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
						<TipMsg>
							💡 Tip: Learn about our <BoldText>Comet Liquidity System</BoldText> that allows our LPs to
							maximize their concentrated liquidity experience.{' '}
						</TipMsg>
						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<AssetView assetId={assetId} />
						</Box>
					</Container>
				</StyledSection>
			</main>
		</div>
	)
}

const BoldText = styled('span')`
	color: #fff;
  text-decoration: underline;
`

export default AssetPage
