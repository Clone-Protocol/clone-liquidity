import * as React from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { StyledSection } from 'pages'
import Container from '@mui/material/Container'
import TipMsg from '~/components/Common/TipMsg'
import AssetView from '~/containers/Overview/AssetView'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import InfoIcon from 'public/images/info-icon.svg'

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
						<Box mb='30px'>
							<Typography variant='p_xxlg'>New Liquidity Position</Typography>
						</Box>
						<TipMsg>
							<Image src={InfoIcon} /> <Typography variant='p' ml='5px' sx={{ cursor: 'pointer' }}>Click here to learn more about Comet Liquidity System (CLS)</Typography>
						</TipMsg>
						<Box display='flex' justifyContent='center' mt="30px">
							<AssetView assetId={assetId} />
						</Box>
					</Container>
				</StyledSection>
			</main>
		</div>
	)
}

export default AssetPage
