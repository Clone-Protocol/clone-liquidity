import type { NextPage } from 'next'
import Head from 'next/head'
import { StyledSection } from 'pages'
import { Container, Box, Typography } from '@mui/material'
import Image from 'next/image'
import InfoIcon from 'public/images/info-icon.svg'
import TipMsg from '~/components/Common/TipMsg'
// import BorrowBox from '~/containers/Borrow/BorrowBox'
import BorrowContainer from '~/containers/Borrow/BorrowContainer'

const Borrow: NextPage = () => {
	return (
		<div>
			<Head>
				<title>Borrow - Incept Liquidity Protocol</title>
				<meta name="description" content="Incept Liquidity Protocol" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				<StyledSection>
					<Container>
						<Box p='20px'>
							<Box mb='25px'><Typography variant='p_xxlg'>New Borrow Position</Typography></Box>
							<TipMsg><Image src={InfoIcon} /> <Typography variant='p' ml='5px' sx={{ cursor: 'pointer' }}>Click here to learn more about how Borrowing works.</Typography></TipMsg>
							<Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
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
