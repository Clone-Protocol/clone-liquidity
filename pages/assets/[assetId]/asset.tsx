import * as React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { styled } from '@mui/system'
import Container from '@mui/material/Container'
import TipMsg from '~/components/Common/TipMsg'
import AssetView from '~/containers/Overview/AssetView'

const AssetPage: NextPage = () => {
	return (
		<div>
			<Head>
				<title>Asset</title>
			</Head>
			<main>
        <StyledSection>
          <Container>
            <TipMsg>💡 Tip: Learn about our Comet Liquidity System that allows our LPs to maximize their concentraed liquidity expereince. </TipMsg>
            <AssetView />
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

export default AssetPage
