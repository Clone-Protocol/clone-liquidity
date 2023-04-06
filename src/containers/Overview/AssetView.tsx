import { Box, Stack, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { useBalanceQuery } from '~/features/Borrow/Balance.query'
import CometIconOn from 'public/images/comet-icon-on.svg'
import UlIconOn from 'public/images/ul-icon-on.svg'
import CometIconOff from 'public/images/comet-icon-off.svg'
import UlIconOff from 'public/images/ul-icon-off.svg'
import { useInitCometDetailQuery } from '~/features/MyLiquidity/CometPosition.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { TabPanel, StyledTabs, MultipoolTab, SinglepoolTab, StyledTab } from '~/components/Common/StyledTab'
import MultipoolCometPanel from './MultipoolCometPanel'
import SinglepoolCometPanel from './SinglepoolCometPanel'
import UnconcentPanel from './UnconcentPanel'
import SelectArrowIcon from 'public/images/keyboard-arrow-left.svg'
import MultipoolIconOff from 'public/images/multipool-icon-off.svg'
import MultipoolIconOn from 'public/images/multipool-icon-on.svg'
import PriceChart from '~/components/Overview/PriceChart'
import PoolAnalytics from '~/components/Overview/PoolAnalytics'
import ChooseLiquidityPoolsDialog from './Dialogs/ChooseLiquidityPoolsDialog'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { StyledDivider } from '~/components/Common/StyledDivider'
import TipMsg from '~/components/Common/TipMsg'
import InfoIcon from 'public/images/info-icon.svg'
import { GoBackButton } from '~/components/Common/CommonButtons'

const AssetView = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
	const router = useRouter()
	const { ltab } = router.query
	const [tab, setTab] = useState(0)
	const [assetIndex, setAssetIndex] = useState(0)
	const [openChooseLiquidity, setOpenChooseLiquidity] = useState(false)

	// sub routing for tab
	useEffect(() => {
		if (ltab && parseInt(ltab.toString()) <= 2) {
			setTab(parseInt(ltab.toString()))
		}
	}, [ltab])

	useEffect(() => {
		if (assetId) {
			// console.log('aa', parseInt(assetId))
			setAssetIndex(parseInt(assetId))
		}
	}, [assetId])

	const { data: balances, refetch } = useBalanceQuery({
		userPubKey: publicKey,
		index: assetIndex,
		refetchOnMount: "always",
		enabled: publicKey != null
	})

	const { data: assetData } = useInitCometDetailQuery({
		userPubKey: publicKey,
		index: assetIndex,
		refetchOnMount: true,
		enabled: publicKey != null
	})

	const openChooseLiquidityDialog = () => {
		setOpenChooseLiquidity(true)
	}

	const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
		setTab(newValue)
	}

	const handleChoosePool = (assetId: number) => {
		setAssetIndex(assetId)
		setOpenChooseLiquidity(false)
	}

	return assetData ? (
		<Box>
			<Stack direction='row' spacing={3} justifyContent="center">
				<Box>
					<GoBackButton onClick={() => router.back()}><Typography variant='p'>Go back</Typography></GoBackButton>
					<Box mb='15px'>
						<Typography variant='p_xxlg'>New Liquidity Position</Typography>
					</Box>
					<TipMsg>
						<Image src={InfoIcon} /> <Typography variant='p' ml='5px' sx={{ cursor: 'pointer' }}>Click here to learn more about Comet Liquidity System (CLS)</Typography>
					</TipMsg>
					<Box mt='15px'><Typography variant='p_lg'>Select Pool</Typography></Box>
					<SelectPoolBox onClick={() => openChooseLiquidityDialog()}>
						<Stack direction='row' gap={1}>
							<Image src={assetData.tickerIcon} width="27px" height="27px" />
							<Typography variant='p_xlg'>{assetData.tickerSymbol} {'<>'} USDi</Typography>
						</Stack>
						<Image src={SelectArrowIcon} />
					</SelectPoolBox>

					<LeftBoxWrapper>
						<StyledTabs value={tab} onChange={handleChangeTab} sx={{ maxWidth: '990px', marginTop: '12px', marginBottom: '12px' }}>
							<MultipoolTab value={0} label='Multipool Comet' icon={tab === 0 ? <Image src={MultipoolIconOn} /> : <Image src={MultipoolIconOff} />} />
							<SinglepoolTab value={1} label='Singlepool Comet' icon={tab === 1 ? <Image src={CometIconOn} /> : <Image src={CometIconOff} />} />
							<StyledTab value={2} label='Unconcentrated' icon={tab === 2 ? <Image src={UlIconOn} /> : <Image src={UlIconOff} />} />
						</StyledTabs>
						<StyledDivider />

						<Box paddingY='5px'>
							<TabPanel value={tab} index={0}>
								<MultipoolCometPanel assetIndex={assetIndex} onRefetchData={() => refetch()} />
							</TabPanel>
							<TabPanel value={tab} index={1}>
								<SinglepoolCometPanel balances={balances} assetData={assetData} assetIndex={assetIndex} onRefetchData={() => refetch()} />
							</TabPanel>
							<TabPanel value={tab} index={2}>
								<UnconcentPanel balances={balances} assetData={assetData} assetIndex={assetIndex} onRefetchData={() => refetch()} />
							</TabPanel>
						</Box>

						<Box display='flex' justifyContent='center'>
							<DataLoadingIndicator />
						</Box>
					</LeftBoxWrapper>
				</Box>

				<RightBoxWrapper>
					<StickyBox>
						<PriceChart assetData={assetData} priceTitle='iAsset Price' />
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
	) : <></>
}

const LeftBoxWrapper = styled(Box)`
	width: 607px; 
	padding: 8px 25px;
	border: solid 1px ${(props) => props.theme.boxes.greyShade};
	margin-bottom: 25px;
`
const RightBoxWrapper = styled(Box)`
	width: 450px;
	padding: 20px;
`
const StickyBox = styled(Box)`
  position: sticky;
  top: 100px;
`
const SelectPoolBox = styled(Box)`
	display: flex;
	justify-content: space-between;
	width: 261px;
	height: 45px;
	margin-top: 10px;
	margin-bottom: 20px;
	cursor: pointer;
	padding: 9px;
	border: solid 1px ${(props) => props.theme.boxes.greyShade};
	&:hover {
		box-shadow: 0 0 0 1px ${(props) => props.theme.palette.text.secondary} inset;
  }
`

export default withSuspense(AssetView, <LoadingProgress />)
