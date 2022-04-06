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
import { PositionInfo as PI, CometInfo, fetchCometDetail } from '~/features/MyLiquidity/CometPosition.query'
import ConcentrationRangeBox from '~/components/Liquidity/comet/ConcentrationRangeBox'
import OneIcon from 'public/images/one-icon.png'
import TwoIcon from 'public/images/two-icon.png'
import { useBalanceQuery } from '~/features/Comet/Balance.query'
import { toScaledNumber } from 'sdk/src/utils'
import { callEdit } from '~/web3/Comet/comet'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'

const EditPanel = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
	const [assetData, setAssetData] = useState<PI>(fetchAsset()) // set default
  const [cometData, setCometData] = useState<CometInfo>({
    isTight: false,
    collRatio: 50,
    lowerLimit: 40.0,
    upperLimit: 180.0
  })
  const [mintAmount, setMintAmount] = useState(0.0)
	const [collAmount, setCollAmount] = useState(0.0)

	const cometIndex = parseInt(assetId)

  const { data: usdiBalance } = useBalanceQuery({ 
    userPubKey: publicKey, 
    refetchOnMount: true,
    enabled: publicKey != null
  });

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
					const comet = await program.getCometPosition(cometIndex)
          console.log('sss', data)
					
          setAssetData(data)
          setMintAmount(toScaledNumber(comet.borrowedUsdi))
					setCollAmount(toScaledNumber(comet.collateralAmount))
          setCometData({
            ...cometData,
            lowerLimit: toScaledNumber(comet.lowerPriceRange),
            upperLimit: toScaledNumber(comet.upperPriceRange)
          })
				}
			}
		}
		fetch()
	}, [publicKey, assetId])

	const handleChangeFromAmount = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)

			const program = getInceptApp()
			let [lowerLimit, upperLimit] = (await program.calculateRangeFromUSDiAndCollateral(
				0,
				(
					await program.getCometPosition(cometIndex)
				).poolIndex,
				amount,
				mintAmount
			))!
			if (lowerLimit && upperLimit) {
        setCometData({
          ...cometData,
          lowerLimit,
          upperLimit
        })
        setCollAmount(amount)
			} else {
				setCollAmount(amount)
			}
		} else {
			setCollAmount(0.0)
		}
	}

	const handleChangeConcentRange = (isTight: boolean, lowerLimit: number, upperLimit: number) => {
		const newData = {
			...cometData,
			isTight,
			lowerLimit,
			upperLimit,
		}
		setCometData(newData)
	}

	const onEdit = async () => {
		const program = getInceptApp()
		await callEdit(program, publicKey!, cometIndex, collAmount)
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={5}>
				<PositionInfo
          assetData={assetData}
          cometData={cometData}
          mintAmount={mintAmount}
					collateralAmount={collAmount}
				/>
			</Grid>
			<Grid item xs={12} md={7}>
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
							value={collAmount}
							headerTitle="Balance"
							headerValue={usdiBalance?.balanceVal}
							onChange={handleChangeFromAmount}
						/>
					</Box>
					<StyledDivider />

					<Box>
						<SubTitle>
							<Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Edit liquidity concentration range</Box>
						</SubTitle>
						<SubTitleComment>Editing concentration range will effect the collateral amount</SubTitleComment>

						<Box sx={{ marginTop: '110px', marginBottom: '15px' }}>
							<ConcentrationRange
								assetData={assetData}
                cometData={cometData}
								onChange={handleChangeConcentRange}
								max={assetData.maxRange}
								defaultLower={(assetData.price / 2)}
								defaultUpper={((assetData.price * 3) / 2)}
							/>
						</Box>

						<ConcentrationRangeBox assetData={assetData} positionInfo={cometData} />
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
  font-size: 18px;
  font-weight: 500;
	margin-bottom: 15px;
`

export default withSuspense(EditPanel, <LoadingProgress />)
