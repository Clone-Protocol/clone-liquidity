import type { NextPage } from 'next'
import Head from 'next/head'
import { StyledSection } from 'pages'
import { Container, Box, Typography } from '@mui/material'
import BorrowContainer from '~/containers/Borrow/BorrowContainer'

const Borrow: NextPage = () => {
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
						<Box p='20px'>
							<Box ml='16px'><Typography variant='p_xxlg'>New Borrow Position</Typography></Box>
							<Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
								<BorrowContainer />
							</Box>
						</Box>
					</Container>
				</StyledSection>
			</main>
		</div>
	)
}

export default Borrow
