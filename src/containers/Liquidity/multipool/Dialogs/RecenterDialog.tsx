import React, { useState } from 'react'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { Box, styled, Button, Stack, Dialog, DialogContent } from '@mui/material'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { useRecenterInfoQuery } from '~/features/MyLiquidity/multipool/RecenterInfo.query'
import { useRecenterMutation } from '~/features/MyLiquidity/multipool/Recenter.mutation'
import { SliderTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import SelectedPoolBox from '~/components/Liquidity/multipool/SelectedPoolBox'

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
	const { enqueueSnackbar } = useSnackbar()
	const [loading, setLoading] = useState(false)

	const { data: positionInfo, refetch } = useRecenterInfoQuery({
		userPubKey: publicKey,
		index: positionIndex,
		refetchOnMount: true,
		enabled: open && publicKey != null,
	})

	const { mutateAsync } = useRecenterMutation(publicKey)
	const handleRecenter = async () => {
		setLoading(true)
		await mutateAsync(
			{
				positionIndex
			},
			{
				onSuccess(data) {
					if (data) {
						console.log('data', data)
						enqueueSnackbar('Successfully recentered the position')

						refetch()
						onRefetchData()
						handleClose()
					}
					setLoading(false)
				},
				onError(err) {
					console.error(err)
					enqueueSnackbar('Failed to recenter position : No price deviation detected.')
					setLoading(false)
				}
			}
		)
	}

	const displayRecenterCost = () => {
		return Math.max(0, positionInfo!.recenterCost).toLocaleString()
	}

	return positionInfo ? (
		<>
			{loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

			<Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={960}>
				<DialogContent sx={{ backgroundColor: '#16171a', padding: '25px 35px', overflow: 'hidden' }}>
					<HeaderText>Recenter</HeaderText>
					<Divider />
					<Stack direction="row" gap={4}>
						<SelectedPoolBox positionInfo={positionInfo} />

						<RightBox>
							<Box marginTop='20px' marginBottom='22px'>
								<TopStack direction="row" justifyContent="space-between">
									<StackTitle>
										Recentering Cost <InfoTooltip title="recenter cost" />
									</StackTitle>
									<StackValue>
										{displayRecenterCost()} USDi
										<StackSubValue>
											${positionInfo.recenterCostDollarPrice.toLocaleString()}
										</StackSubValue>
									</StackValue>
								</TopStack>
								<BottomBox>
									Total Collateral Value:{' '}
									<span style={{ color: '#fff' }}>${positionInfo.totalCollValue.toLocaleString()}</span>
								</BottomBox>
							</Box>

							<StyledDivider />

							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<SubTitle>
									Projected Health Score <InfoTooltip title="projected health score" />
								</SubTitle>
								<DetailValue>
									{positionInfo.healthScore.toFixed(2)}/100{' '}
									<span style={{ color: '#949494' }}>(prev. {positionInfo.prevHealthScore.toFixed(2)}/100)</span>
								</DetailValue>
							</Stack>

							<Stack direction="row" justifyContent="space-between" alignItems="center">
								<SubTitle>
									Estimated Total Collateral After Recentering{' '}
									<InfoTooltip title="Estimated collateral after recentering" />
								</SubTitle>
								<DetailValue>
									{positionInfo.estimatedTotalCollValue.toLocaleString()} USDi{' '}
									<span style={{ color: '#949494' }}>
										(${positionInfo.estimatedTotalCollDollarPrice.toLocaleString()})
									</span>
								</DetailValue>
							</Stack>

							<StyledDivider />
							<ActionButton onClick={() => handleRecenter()} disabled={!positionInfo.isValidToRecenter}>
								Recenter
							</ActionButton>
						</RightBox>
					</Stack>
				</DialogContent>
			</Dialog>
		</>
	) : (
		<></>
	)
}

const HeaderText = styled(Box)`
	font-size: 14px;
	font-weight: 600;
	text-align: center;
	color: #fff;
`

const Divider = styled('div')`
	width: 100%;
	height: 1px;
	margin-top: 17px;
	margin-bottom: 10px;
	background-color: #2c2c2c;
`
const RightBox = styled(Box)`
  min-width: 550px; 
  padding: 8px 18px; 
  color: #fff;
`
const TopStack = styled(Stack)`
  border-top-right-radius: 10px; 
  border-top-left-radius: 10px; 
  border: solid 1px #444; 
  padding: 12px 24px 12px 27px;
`
const StackTitle = styled('div')`
  font-size: 11px; 
  font-weight: 600; 
  color: #fff9f9; 
  display: flex; 
  align-items: center;
`
const StackValue = styled('div')`
  font-size: 16px; 
  font-weight: 500; 
  color: #fff;
`
const StackSubValue = styled('div')`
  font-size: 10px; 
  color: #b9b9b9; 
  text-align: right;
`
const BottomBox = styled(Box)`
	background: #252627;
	font-size: 11px;
	font-weight: 500;
	color: #949494;
	text-align: center;
	height: 28px;
	padding-top: 6px;
	border-bottom: solid 1px #444;
	border-left: solid 1px #444;
	border-right: solid 1px #444;
	border-bottom-left-radius: 9px;
	border-bottom-right-radius: 9px;
`
const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 10px;
	margin-top: 10px;
	height: 1px;
`

const SubTitle = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
`
const DetailValue = styled('div')`
	font-size: 11px;
	font-weight: 500;
	color: #fff;
`
const ActionButton = styled(Button)`
	width: 100%;
	height: 45px;
	flex-grow: 0;
	border-radius: 10px;
	background-color: #4e3969;
	font-size: 13px;
	font-weight: 600;
	color: #fff;
	margin-top: 15px;
	&:hover {
		background-color: #7a86b6;
	}
	&:disabled {
		background-color: #444;
		color: #adadad;
	}
`
export default RecenterDialog
