import { Box, Stack, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { useInitCometDetailQuery } from '~/features/MyLiquidity/comet/CometInfo.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { TabPanel } from '~/components/Common/StyledTab'
import CometPanel from './CometPanel'
import { useRouter } from 'next/navigation'
import SelectArrowIcon from 'public/images/keyboard-arrow-left.svg'
import PriceChart from '~/components/Overview/PriceChart'
import PoolAnalytics from '~/components/Overview/PoolAnalytics'
// import ChooseLiquidityPoolsDialog from './Dialogs/ChooseLiquidityPoolsDialog'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import TipMsg from '~/components/Common/TipMsg'
import InfoIcon from 'public/images/info-icon.svg'
import { GoBackButton } from '~/components/Common/CommonButtons'
import { ASSETS, AssetTickers } from '~/data/assets'
import dynamic from 'next/dynamic'

const AssetView = ({ assetTicker }: { assetTicker: string }) => {
	const { publicKey } = useWallet()
	const router = useRouter()
	const tab = 0
	const [assetIndex, setAssetIndex] = useState(0)
	const [openChooseLiquidity, setOpenChooseLiquidity] = useState(false)
	const ChooseLiquidityPoolsDialog = dynamic(() => import('./Dialogs/ChooseLiquidityPoolsDialog'))

	// sub routing for tab
	// useEffect(() => {
	// 	if (ltab && parseInt(ltab.toString()) <= 1) {
	// 		setTab(parseInt(ltab.toString()))
	// 	}
	// }, [ltab])

	useEffect(() => {
		if (assetTicker) {
			console.log('assetId', AssetTickers[assetTicker as keyof typeof AssetTickers])

			if (AssetTickers[assetTicker as keyof typeof AssetTickers]) {
				setAssetIndex(AssetTickers[assetTicker as keyof typeof AssetTickers])
			} else {
				setAssetIndex(AssetTickers.euro)
				router.replace('/assets/euro')
			}
		}
	}, [assetTicker])

	const { data: assetData, refetch } = useInitCometDetailQuery({
		userPubKey: publicKey,
		index: assetIndex,
		refetchOnMount: "always",
		enabled: publicKey != null
	})

	const openChooseLiquidityDialog = () => {
		setOpenChooseLiquidity(true)
	}

	const handleChoosePool = (assetId: number) => {
		setAssetIndex(assetId)
		setOpenChooseLiquidity(false)

		router.replace(`/assets/${ASSETS[assetId].ticker}`)
	}

	return assetData ? (
		<Box>
			<Stack direction='row' spacing={9} justifyContent="center">
				<Box>
					<GoBackButton onClick={() => router.back()}><Typography variant='p'>{'<'} Go back</Typography></GoBackButton>
					<Box mb='15px'>
						<Typography variant='p_xxlg'>New Comet Liquidity Position</Typography>
					</Box>
					<a href="https://docs.clone.so/system-architecture/comet-liquidity-system" target="_blank" rel="noreferrer">
						<TipMsg>
							<Image src={InfoIcon} alt='info' />
							<Typography variant='p' ml='5px' sx={{ cursor: 'pointer' }}>Comet Liquidity System is built to introduce hyper liquidity to our onAssets. Click to learn more.</Typography>
						</TipMsg>
					</a>

					<LeftBoxWrapper>
						<Box paddingY='5px'>
							<TabPanel value={tab} index={0}>
								<CometPanel assetIndex={assetIndex} onRefetchData={() => refetch()}>
									<Box>
										<Box><Typography variant='p_lg'>Select Liquidity Pool</Typography></Box>
										<SelectPoolBox onClick={() => openChooseLiquidityDialog()}>
											<Stack direction='row' gap={1} alignItems='center'>
												<Image src={assetData.tickerIcon} width={20} height={20} alt={assetData.tickerSymbol} />
												<Typography variant='p_lg' mb='3px'>{assetData.tickerSymbol}{'/'}devUSD</Typography>
											</Stack>
											<Image src={SelectArrowIcon} alt='select' />
										</SelectPoolBox>
									</Box>
								</CometPanel>
							</TabPanel>
						</Box>
					</LeftBoxWrapper>
				</Box>

				<RightBoxWrapper>
					<StickyBox>
						<PriceChart assetData={assetData} priceTitle='Oracle Price' />
						<PoolAnalytics tickerSymbol={assetData.tickerSymbol} />
					</StickyBox>
				</RightBoxWrapper>
			</Stack>

			<ChooseLiquidityPoolsDialog
				open={openChooseLiquidity}
				handleChoosePool={handleChoosePool}
				handleClose={() => setOpenChooseLiquidity(false)}
				noFilter={tab !== 0}
			/>
		</Box>
	) : <><Typography variant='p_lg'>Please Connect Wallet</Typography></>
}

const LeftBoxWrapper = styled(Box)`
	width: 600px; 
	padding: 8px 0px;
	margin-bottom: 65px;
`
const RightBoxWrapper = styled(Box)`
	width: 472px;
	padding: 8px 0px;
`
const StickyBox = styled(Box)`
  position: sticky;
  top: 100px;
`
const SelectPoolBox = styled(Box)`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 195px;
	height: 40px;
	margin-top: 10px;
	margin-bottom: 20px;
	background-color: rgba(37, 141, 237, 0.15);
	border-radius: 5px;
	cursor: pointer;
	padding: 8px;
	&:hover {
		box-shadow: 0 0 0 1px ${(props) => props.theme.basis.liquidityBlue} inset;
		background-color: rgba(37, 141, 237, 0.23);
  }
`

export default withSuspense(AssetView, <LoadingProgress />)
