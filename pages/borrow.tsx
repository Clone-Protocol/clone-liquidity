import type { NextPage } from 'next'
import Head from 'next/head'
import { StyledSection } from 'pages'
import { Container, Box, Typography } from '@mui/material'
import BorrowContainer from '~/containers/Borrow/BorrowContainer'

const Borrow: NextPage = () => {
	return (
		<div>
			<Head>
				<title>Borrow - Clone Liquidity Protocol</title>
				<meta name="description" content="Clone Liquidity Protocol" />
				<link rel="icon" href="/favicon.ico" />
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
