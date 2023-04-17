import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Box, styled, Stack, Dialog, DialogContent, Typography } from '@mui/material'
import { useRecenterInfoQuery } from '~/features/MyLiquidity/multipool/RecenterInfo.query'
import { useRecenterMutation } from '~/features/MyLiquidity/multipool/Recenter.mutation'
import { FadeTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { TooltipTexts } from '~/data/tooltipTexts'
import Image from 'next/image'
import HealthscoreBar from '~/components/Overview/HealthscoreBar'
import { SubmitButton } from '~/components/Common/CommonButtons'

const RecenterDialog = ({
	positionIndex,
	poolIndex,
	open,
	onRefetchData,
	handleClose,
}: {
	positionIndex: number
	poolIndex: number
	open: boolean
	onRefetchData: () => void
	handleClose: () => void
}) => {
	const { publicKey } = useWallet()
	const { data: positionInfo, refetch } = useRecenterInfoQuery({
		userPubKey: publicKey,
		index: positionIndex,
		refetchOnMount: true,
		enabled: open && publicKey != null,
	})

	const { mutateAsync } = useRecenterMutation(publicKey)
	const handleRecenter = async () => {
		try {
			const data = await mutateAsync(
				{
					positionIndex
				}
			)

			if (data) {
				console.log('data', data)
				refetch()
				onRefetchData()
				handleClose()
			}
		} catch (err) {
			console.error(err)
		}
	}

	const displayRecenterCost = () => {
		return Math.max(0, positionInfo!.recenterCost).toLocaleString()
	}

	return positionInfo ? (
		<>
			<Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={480}>
				<DialogContent sx={{ background: '#1b1b1b' }}>
					<BoxWrapper>
						<Box mb='16px'><Typography variant='p_xlg'>Recenter Multipool Liquidity Position</Typography></Box>
						<BoxWithBorder width='261px' p='9px'>
							<Stack direction='row' gap={1}>
								<Image src={positionInfo.tickerIcon} width="27px" height="27px" />
								<Box>
									<Typography variant='p_xlg'>{positionInfo.tickerSymbol} {'<>'} USDi</Typography>
								</Box>
							</Stack>
						</BoxWithBorder>

						<Box marginTop='20px' marginBottom='22px'>
							<Box display='flex' justifyContent='flex-end'>
								<Typography variant='p' color='#989898'>Wallet Balance: </Typography>
								<Typography variant='p' ml='5px'>{positionInfo.usdiVal.toLocaleString(undefined, { maximumFractionDigits: 5 })}</Typography>
							</Box>
							<CenterBox>
								<Stack direction="row" justifyContent="space-between">
									<Box><Typography variant='p'>Recentering Cost</Typography> <InfoTooltip title={TooltipTexts.recenteringCost} /></Box>
									<Box lineHeight={0.95}>
										<Box><Typography variant='p_xlg'>{displayRecenterCost()} USDi</Typography></Box>
										<Box textAlign='right'><Typography variant='p' color='#989898'>${positionInfo.recenterCostDollarPrice.toLocaleString()}</Typography></Box>
									</Box>
								</Stack>
							</CenterBox>
							{/* <BottomBox>
								<Typography variant='p' color='#989898'>Total Collateral Value: </Typography> <Typography variant='p'>${positionInfo.totalCollValue.toLocaleString()}</Typography>
							</BottomBox> */}
						</Box>

						<BoxWithBorder mt='13px' padding='15px'>
							<Box>
								<Box><Typography variant='p'>Projected Healthscore</Typography> <InfoTooltip title={TooltipTexts.projectedMultipoolHealthScoreRecentering} /></Box>
								<HealthscoreBar score={positionInfo.healthScore} prevScore={positionInfo.prevHealthScore} hideIndicator={true} width={440} />
							</Box>

							{/* <Stack direction="row" justifyContent="space-between">
								<Box maxWidth='130px' lineHeight='14px'><Typography variant='p'>Estimated total collateral after Recentering</Typography></Box>
								<Box lineHeight='14px' textAlign='right'>
									<Box><Typography variant='p_lg'>{positionInfo.estimatedTotalCollValue.toLocaleString()} USDi</Typography></Box>
									<Box><Typography variant='p' color='#989898'>${positionInfo.estimatedTotalCollDollarPrice.toLocaleString()} USD</Typography></Box>
								</Box>
							</Stack> */}
						</BoxWithBorder>

						<SubmitButton onClick={() => handleRecenter()} disabled={!positionInfo.isValidToRecenter}>
							Recenter Now
						</SubmitButton>

						<Box display='flex' justifyContent='center'>
							<DataLoadingIndicator onRefresh={() => refetch()} />
						</Box>
					</BoxWrapper>
				</DialogContent>
			</Dialog>
		</>
	) : (
		<></>
	)
}


const BoxWrapper = styled(Box)`
  width: 480px;
  color: #fff;
  overflow-x: hidden;
`
const CenterBox = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  padding: 18px 15px;
`
// const BottomBox = styled(Box)`
//   text-align: center;
//   height: 30px;
//   border: solid 1px ${(props) => props.theme.boxes.greyShade};
// `
const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`

export default RecenterDialog
