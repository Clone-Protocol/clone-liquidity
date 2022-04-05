import React, { useEffect, useState } from 'react'
import { Grid, Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import PositionInfo from '~/components/Liquidity/comet/PositionInfo'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as PI, fetchCometDetail } from '~/features/MyLiquidity/CometPosition.query'
import { FilterType } from '~/data/filter'
import { fetchPools, PoolList } from '~/web3/MyLiquidity/CometPools'
import { toScaledNumber } from 'sdk/src/utils'
import { callClose } from '~/web3/Comet/comet'

const ClosePanel = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
	const [filter, setFilter] = useState<FilterType>('all')
	const { getInceptApp } = useIncept()
	const [positionInfo, setPositionInfo] = useState<PI>()
	const [collateralAmount, setCollateralAmount] = useState(0)
	const [ild, setILD] = useState(0)
	const cometIndex = parseInt(assetId)

	useEffect(() => {
		const program = getInceptApp()

		async function fetch() {
			if (assetId) {
				const data = (await fetchCometDetail({
					program,
					userPubKey: publicKey,
					index: cometIndex,
				})) as PI
				let comet = await program.getCometPosition(cometIndex)
				data.lowerLimit = toScaledNumber(comet.lowerPriceRange)
				data.upperLimit = toScaledNumber(comet.upperPriceRange)
				data.mintAmount = toScaledNumber(comet.borrowedUsdi)
				data.collAmount = toScaledNumber(comet.collateralAmount)
				setPositionInfo(data)
				const collateralAmount = toScaledNumber(comet.collateralAmount)
				setCollateralAmount(collateralAmount)
				const ild = (
					(await fetchPools({
						program,
						userPubKey: publicKey,
						filter,
					})) as PoolList[]
				)[cometIndex].ild
				setILD(ild)
			}
		}
		fetch()
	}, [publicKey, assetId])

	const onClose = async () => {
		const program = getInceptApp()
		await callClose(program, publicKey!, cometIndex)
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={4}>
				<PositionInfo positionInfo={positionInfo} />
			</Grid>
			<Grid item xs={12} md={8}>
				<Box sx={{ padding: '30px' }}>
					<Stack direction="row" justifyContent="space-between">
						<DetailHeader>Collateral</DetailHeader>
						<DetailValue>{collateralAmount} USDi</DetailValue>
					</Stack>
					<Stack sx={{ marginTop: '10px' }} direction="row" justifyContent="space-between">
						<DetailHeader>ILD</DetailHeader>
						<DetailValue>{ild} USDi</DetailValue>
					</Stack>
					<Stack sx={{ marginTop: '30px' }} direction="row" justifyContent="space-between">
						<DetailHeader>Withdraw amount</DetailHeader>
						<DetailValue>{collateralAmount - ild} USDi</DetailValue>
					</Stack>
					<StyledDivider />
					<ActionButton onClick={onClose}>Close</ActionButton>
				</Box>
			</Grid>
		</Grid>
	)
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 39px;
	margin-top: 39px;
	height: 1px;
`

const DetailHeader = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #989898;
`

const DetailValue = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #fff;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #7d7d7d;
	color: #fff;
	border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
	margin-bottom: 15px;
`

export default ClosePanel
