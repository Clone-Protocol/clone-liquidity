import React, { useState, useEffect } from 'react'
import { Grid, Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import PositionInfo from '~/components/Liquidity/borrow/PositionInfo'
import PairInput from '~/components/Borrow/PairInput'
import ethLogo from 'public/images/assets/ethereum-eth-logo.svg'
import { callEdit } from '~/web3/Borrow/borrow'
// import RatioSlider from '~/components/Borrow/RatioSlider'
import {
	PositionInfo as PositionInfoType,
	fetchBorrowDetail,
	PairData,
	fetchPositionDetail,
} from '~/web3/MyLiquidity/BorrowPosition'
import { fetchBalance } from '~/web3/Borrow/balance'

const EditPanel = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
	const [fromPair, setFromPair] = useState<PairData>({
		tickerIcon: ethLogo,
		tickerName: 'USDi Coin',
		tickerSymbol: 'USDi',
		balance: 0.0,
		amount: 0.0,
	})

	// const [collRatio, setCollRatio] = useState(150)
	const [positionInfo, setPositionInfo] = useState<PositionInfoType>()
	const [borrowAmount, setBorrowAmount] = useState(0.0)
	const [borrowIndex, _] = useState(0)

	useEffect(() => {
		const program = getInceptApp()

		async function fetch() {
			if (assetId) {
				const data = (await fetchBorrowDetail({
					program,
					userPubKey: publicKey,
					index: parseInt(assetId) - 1,
				})) as PositionInfoType
				if (data) {
					const positionData = await fetchPositionDetail(program, publicKey!, borrowIndex)
					data.borrowedIasset = positionData![0]
					data.collateralAmount = positionData![1]
					data.collateralRatio = positionData![2]
					data.minCollateralRatio = positionData![3]
					setPositionInfo(data)
				}
				const balance = await fetchBalance({
					program,
					userPubKey: publicKey,
				})
				if (balance) {
				}
				setFromPair({
					...fromPair,
					balance: balance!.balanceVal,
				})
			}
		}
		fetch()
	}, [publicKey, assetId])

	const handleChangeFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = e.currentTarget.value
		if (newVal) {
			let data = {
				...positionInfo,
				collateralAmount: parseFloat(newVal),
				collateralRatio: parseFloat(newVal) / (positionInfo!.borrowedIasset * positionInfo!.oPrice) * 100,
			} as PositionInfoType
			setPositionInfo(data)
			setFromPair({...fromPair, amount: parseFloat(newVal)})
		}
	}

	// const handleChangeCollRatio = (event: Event, newValue: number | number[]) => {
	//   if (typeof newValue === 'number') {
	//     setCollRatio(newValue)
	//   }
	// }

	const onEdit = async () => {
		const program = getInceptApp()
		let cometIndex = 0
		await callEdit(program, publicKey!, cometIndex, positionInfo!.collateralAmount)
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={4}>
				<PositionInfo positionInfo={positionInfo} fromPair={fromPair} borrowAmount={borrowAmount} />
			</Grid>
			<Grid item xs={12} md={8}>
				<Box sx={{ padding: '30px', color: '#fff' }}>
					<Box>
						<SubTitle>(1) Edit collateral amount</SubTitle>
						<SubTitleComment>Editing collateral will effect the collateral ratio</SubTitleComment>
						<PairInput
							tickerIcon={fromPair.tickerIcon}
							tickerName={fromPair.tickerName}
							tickerSymbol={fromPair.tickerSymbol}
							value={fromPair.amount}
							balance={fromPair.balance}
							onChange={handleChangeFrom}
						/>
					</Box>
					<StyledDivider />

					{/* <Box>
            <SubTitle>(2) Edit collateral ratio</SubTitle>
            <SubTitleComment>To avoid liquidation, collateral ratio above safe point is reccommended</SubTitleComment>
            <RatioSlider min={0} max={500} value={collRatio} onChange={handleChangeCollRatio} />
          </Box>
          <StyledDivider /> */}

					<Box>
						<SubTitle>(2) Borrow Amount</SubTitle>
						<SubTitleComment>Borrowed amount can’t be edited</SubTitleComment>
						<PairInput
							tickerIcon={ethLogo}
							tickerName="Incept USD"
							tickerSymbol="USDi"
							value={borrowAmount}
							disabled
							balanceDisabled
						/>
					</Box>
					<StyledDivider />

					<ActionButton onClick={onEdit}>Edit</ActionButton>
				</Box>
			</Grid>
		</Grid>
	)
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 39px;
	margin-top: 20px;
	height: 1px;
`

const SubTitle = styled('div')`
	font-size: 18px;
	font-weight: 500;
	margin-bottom: 17px;
	color: #fff;
`

const SubTitleComment = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #989898;
	margin-bottom: 10px;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #7d7d7d;
	color: #fff;
	border-radius: 8px;
	margin-bottom: 15px;
`

export default EditPanel
