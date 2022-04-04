import React, { useState, useEffect } from 'react'
import { Grid, Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import PositionInfo from '~/components/Liquidity/borrow/PositionInfo'
import PairInput from '~/components/Borrow/PairInput'
import Image from 'next/image'
import SelectPairInput from '~/components/Borrow/SelectPairInput'
import { callEdit } from '~/web3/Borrow/borrow'
import { fetchAsset } from '~/features/Overview/Asset.query'
import OneIcon from 'public/images/one-icon.png'
import TwoIcon from 'public/images/two-icon.png'
// import RatioSlider from '~/components/Borrow/RatioSlider'
import {
	PositionInfo as PositionInfoType,
	fetchBorrowDetail,
	PairData,
	fetchPositionDetail,
} from '~/web3/MyLiquidity/BorrowPosition'
import { fetchBalance } from '~/features/Borrow/Balance.query'
import { ASSETS } from '~/features/assetData'

const EditPanel = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
	const [fromPair, setFromPair] = useState<PairData>({
		tickerIcon: '/images/assets/USDi.png',
		tickerName: 'USDi Coin',
		tickerSymbol: 'USDi',
		balance: 0.0,
		amount: 0.0,
	})

	// const [collRatio, setCollRatio] = useState(150)
	const [positionInfo, setPositionInfo] = useState<PositionInfoType>()
	const [borrowAmount, setBorrowAmount] = useState(0.0)
	const [borrowIndex, _] = useState(parseInt(assetId) - 1)
	const [iassetBalance, setIassetBalance] = useState(0.0)

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
				const balance = await fetchBalance({
					program,
					userPubKey: publicKey,
					index: mint.poolIndex,
				})
				if (balance) {
					setFromPair({
						...fromPair,
						balance: balance!.usdiVal,
					})
					setIassetBalance(balance!.iassetVal)
				}
			}
		}
		fetch()
	}, [publicKey, assetId])

	const handleChangeFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = e.currentTarget.value
		if (newVal) {
			setFromPair({ ...fromPair, amount: parseFloat(newVal) })
		}
	}

	// const handleChangeCollRatio = (event: Event, newValue: number | number[]) => {
	//   if (typeof newValue === 'number') {
	//     setCollRatio(newValue)
	//   }
	// }

	const handleChangeBorrowAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = e.currentTarget.value
		if (newVal) {
			setBorrowAmount(parseFloat(newVal))
		}
	}

	const onEdit = async () => {
		const program = getInceptApp()
		await callEdit(program, publicKey!, borrowIndex, fromPair.amount, borrowAmount)
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={4}>
				<PositionInfo positionInfo={positionInfo} />
			</Grid>
			<Grid item xs={12} md={8}>
				<Box sx={{ padding: '30px', color: '#fff' }}>
					<Box>
						<SubTitle><Image src={OneIcon} /> <Box sx={{ marginLeft: '9px' }}>Edit collateral amount</Box></SubTitle>
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
						<SubTitle><Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Borrow Amount</Box></SubTitle>
						<SubTitleComment>
							The position can be closed when the full borrowed amount is repayed
						</SubTitleComment>
						<Box sx={{ marginTop: '20px' }}>
							<PairInput
								tickerIcon={
									positionInfo ? positionInfo!.tickerIcon : '/images/assets/ethereum-eth-logo.svg'
								}
								tickerName={positionInfo ? positionInfo!.tickerName : ''}
								tickerSymbol={positionInfo ? positionInfo!.tickerSymbol : ''}
								balance={iassetBalance}
								value={borrowAmount}
								onChange={handleChangeBorrowAmount}
							/>
						</Box>

						{/* <PairInput
							tickerIcon={ethLogo}
							tickerName="Incept USD"
							tickerSymbol="USDi"
							value={borrowAmount}
							disabled
							balanceDisabled
						/> */}
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
  display: flex;
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
  font-size: 18px;
  font-weight: 500;
	margin-bottom: 15px;
`

export default EditPanel
