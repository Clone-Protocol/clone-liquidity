import React, { useEffect, useState } from 'react'
import { Grid, Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import PositionInfo from '~/components/Liquidity/comet/PositionInfo'
import PairInput from '~/components/Asset/PairInput'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import { fetchAsset } from '~/features/Overview/Asset.query'
import { PositionInfo as PI, fetchCometDetail } from '~/web3/MyLiquidity/CometPosition'
import ConcentrationRangeBox from '~/components/Liquidity/comet/ConcentrationRangeBox'
import OneIcon from 'public/images/one-icon.png'
import TwoIcon from 'public/images/two-icon.png'
import { fetchBalance } from '~/web3/Comet/balance'
import { toScaledNumber } from 'sdk/src/utils'
import { callEdit } from '~/web3/Comet/comet'
import { BalanceSharp } from '@mui/icons-material'

const EditPanel = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
	const [positionInfo, setPositionInfo] = useState<PI>(fetchAsset()) // set default
	const [collAmount, setCollAmount] = useState(0)
	const [lowerLimit, setLowerLimit] = useState(0)
	const [upperLimit, setUpperLimit] = useState(0)
	const [usdiBalance, setUsdiBalance] = useState(0)
	const [cometIndex, _] = useState(parseInt(assetId) - 1)

	useEffect(() => {
		const program = getInceptApp()

		async function fetch() {
			if (assetId) {
				const data = (await fetchCometDetail({
					program,
					userPubKey: publicKey,
					index: cometIndex,
				})) as PI
				if (data) {
					let comet = await program.getCometPosition(cometIndex)
					data.lowerLimit = toScaledNumber(comet.lowerPriceRange)
					data.upperLimit = toScaledNumber(comet.upperPriceRange)
					data.mintAmount = toScaledNumber(comet.borrowedUsdi)
					data.collAmount = toScaledNumber(comet.collateralAmount)
					setPositionInfo(data)
					setCollAmount(data.collAmount)
					setLowerLimit(data.lowerLimit)
					setUpperLimit(data.upperLimit)
				}

				const balances = await fetchBalance({
					program,
					userPubKey: publicKey,
				})
				if (balances) {
					// TODO: need refactor this.
					setUsdiBalance(balances.balanceVal)
				}
			}
		}
		fetch()
	}, [publicKey, assetId])

	const handleChangeFromAmount = async (e: React.ChangeEvent<HTMLInputElement>) => {
		let newData
		if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)

			const program = getInceptApp()
			let [lowerLimit, upperLimit] = (await program.calculateRangeFromUSDiAndCollateral(
				0,
				(await program.getCometPosition(cometIndex)).poolIndex,
				amount,
				positionInfo.mintAmount
			))!
			if (lowerLimit && upperLimit) {
				newData = {
					...positionInfo,
					collAmount: amount,
					lowerLimit,
					upperLimit,
				}
			} else {
				newData = {
					...positionInfo,
					collAmount: amount,
				}
			}
		} else {
			newData = {
				...positionInfo,
				collAmount: 0.0,
			}
		}
		setPositionInfo(newData)
	}

	const handleChangeConcentRange = (isTight: boolean, lowerLimit: number, upperLimit: number) => {
		const newData = {
			...positionInfo,
			isTight,
			lowerLimit,
			upperLimit,
		}
		setPositionInfo(newData)
	}

	const onEdit = async () => {
		const program = getInceptApp()
		await callEdit(program, publicKey!, cometIndex, positionInfo.collAmount)
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={4}>
				<PositionInfo positionInfo={positionInfo} collateralAmount={collAmount} lowerLimit={lowerLimit} upperLimit={upperLimit} />
			</Grid>
			<Grid item xs={12} md={8}>
				<Box sx={{ padding: '30px', color: '#fff' }}>
					<Box>
						<SubTitle>
							<Image src={OneIcon} /> <Box sx={{ marginLeft: '9px' }}>Edit collateral amount</Box>
						</SubTitle>
						<SubTitleComment>Editing collateral amount will change the concentration range</SubTitleComment>
						<PairInput
							tickerIcon={'/images/assets/USDi.png'}
							tickerName="USDi Coin"
							tickerSymbol="USDi"
							value={positionInfo?.collAmount}
							headerTitle="Balance"
							headerValue={usdiBalance}
							onChange={handleChangeFromAmount}
						/>
					</Box>
					<StyledDivider />

					<Box>
						<SubTitle>
							<Image src={TwoIcon} />{' '}
							<Box sx={{ marginLeft: '9px' }}>Edit liquidity concentration range</Box>
						</SubTitle>
						<SubTitleComment>Editing concentration range will effect the collateral amount</SubTitleComment>

						<Box sx={{ marginTop: '110px', marginBottom: '15px' }}>
							<ConcentrationRange
								assetData={positionInfo}
								onChange={handleChangeConcentRange}
								max={positionInfo.maxRange}
								defaultLower={positionInfo.lowerLimit}
								defaultUpper={positionInfo.upperLimit}
							/>
						</Box>

						<ConcentrationRangeBox positionInfo={positionInfo} />
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
	margin-bottom: 30px;
	margin-top: 30px;
	height: 1px;
`

const SubTitle = styled('div')`
	display: flex;
	font-size: 18px;
	font-weight: 500;
	marginbottom: 17px;
	color: #fff;
`

const SubTitleComment = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #989898;
	marginbottom: 18px;
	margin-top: 10px;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #7d7d7d;
	color: #fff;
	border-radius: 8px;
	margin-bottom: 15px;
`

export default EditPanel
