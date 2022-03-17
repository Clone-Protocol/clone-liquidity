import React, { useEffect, useState } from 'react'
import { Grid, Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import PositionInfo from '~/components/Liquidity/borrow/PositionInfo'
import { PositionInfo as PI } from '~/web3/MyLiquidity/BorrowPosition'
import { useWallet } from '@solana/wallet-adapter-react'
import { useIncept } from '~/hooks/useIncept'
import {
	PositionInfo as PositionInfoType,
	fetchBorrowDetail,
	fetchPositionDetail,
} from '~/web3/MyLiquidity/BorrowPosition'
import { callClose } from '~/web3/Borrow/borrow'

const ClosePanel = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
	const [positionInfo, setPositionInfo] = useState<PI>()
	const [borrowIndex, _] = useState(parseInt(assetId) - 1)

	useEffect(() => {
		const program = getInceptApp()

		async function fetch() {
			if (assetId) {
				let mint = await program.getMintPosition(borrowIndex)
				const data = (await fetchBorrowDetail({
					program,
					userPubKey: publicKey,
					index: mint.poolIndex,
				})) as PositionInfoType
				if (data) {
					const positionData = await fetchPositionDetail(program, publicKey!, borrowIndex)
					data.borrowedIasset = positionData![0]
					data.collateralAmount = positionData![1]
					data.collateralRatio = positionData![2]
					data.minCollateralRatio = positionData![3]
					setPositionInfo(data)
				}
			}
		}
		fetch()
	}, [publicKey, assetId])

	const onClose = async () => {
		const program = getInceptApp()
		await callClose(program, publicKey!, borrowIndex)
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={4}>
				<PositionInfo positionInfo={positionInfo} />
			</Grid>
			<Grid item xs={12} md={8}>
				<Box sx={{ padding: '30px' }}>
					<Stack direction="row" justifyContent="space-between" sx={{ marginBottom: '15px' }}>
						<DetailHeader>Repay-Burn amount</DetailHeader>
						<DetailValue>
							{positionInfo?.borrowedIasset} {positionInfo?.tickerSymbol}
						</DetailValue>
					</Stack>
					<Stack direction="row" justifyContent="space-between">
						<DetailHeader>Withdraw amount</DetailHeader>
						<DetailValue>{positionInfo?.collateralAmount} USDi</DetailValue>
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
	font-size: 18px;
	font-weight: 500;
	color: #fff;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #7d7d7d;
	color: #fff;
	border-radius: 8px;
	margin-bottom: 15px;
`

export default ClosePanel
