import { Box, Stack, Button, Paper, Divider } from '@mui/material'
import React, { useState, useEffect, useCallback } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import PairInput from '~/components/Asset/PairInput'
import PairInputView from '~/components/Asset/PairInputView'
// import RatioSlider from '~/components/Borrow/RatioSlider'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import ConcentrationRangeBox from '~/components/Liquidity/comet/ConcentrationRangeBox'
import InfoBookIcon from 'public/images/info-book-icon.png'
import WarningIcon from 'public/images/warning-icon.png'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { fetchBalance, useBalanceQuery } from '~/features/Borrow/Balance.query'
import OneIcon from 'public/images/one-icon.png'
import TwoIcon from 'public/images/two-icon.png'
import ThreeIcon from 'public/images/three-icon.png'
import CometIcon from 'public/images/comet-icon.png'
import UnconcentIcon from 'public/images/ul-icon.png'
import { PositionInfo as PI, fetchInitializeCometDetail, useInitCometDetailQuery, CometInfo } from '~/features/MyLiquidity/CometPosition.query'
import { UnconcentratedData as UnconcentPI } from '~/web3/MyLiquidity/UnconcentPosition'
import { fetchAsset, fetchUnconcentrated } from '~/features/Overview/Asset.query'
import { callComet } from '~/web3/Comet/comet'
import { callLiquidity } from '~/web3/UnconcentratedLiquidity/liquidity'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'

const AssetView = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
	const [tab, setTab] = useState(0)
  const assetIndex = parseInt(assetId)

	// const [assetData, setAssetData] = useState<PI>(fetchAsset()) // set default
  const [cometData, setCometData] = useState<CometInfo>({
    isTight: false,
    // collAmount: 0.0,
    collRatio: 50,
    // mintAmount: 0.0,
    lowerLimit: 40.0,
    upperLimit: 180.0
  })
  const [collAmount, setCollAmount] = useState(0.0)
  const [mintAmount, setMintAmount] = useState(0.0)

	//unconcentrated liquidity
	const [unconcentData, setUnconcentData] = useState<UnconcentPI>(fetchUnconcentrated())

  const { data: balances } = useBalanceQuery({
    userPubKey: publicKey,
    index: assetIndex,
	  refetchOnMount: true,
    enabled: publicKey != null
	})

  const { data: assetData } = useInitCometDetailQuery({
    userPubKey: publicKey,
    index: assetIndex,
	  refetchOnMount: true,
    enabled: publicKey != null
	})

  useEffect(() => {
    if (assetData) {
      setCometData({
        ...cometData,
        lowerLimit: assetData.price / 2,
        upperLimit: (assetData.price * 3) / 2
      })
    }
  }, [assetData])

  useEffect(() => {
    async function fetch() {
      if (collAmount && mintAmount) {
        console.log('calculateRange', collAmount +"/"+mintAmount)
        const program = getInceptApp()
        let [lowerLimit, upperLimit] = (await program.calculateRangeFromUSDiAndCollateral(
          0,
          assetIndex,
          collAmount,
          mintAmount
        ))!

        console.log('l', lowerLimit)
        console.log('u', upperLimit)
        // if (lowerLimit && upperLimit) {
          setCometData({
            ...cometData,
            lowerLimit,
            upperLimit
          })
        // }
      }
    }
    fetch()
  }, [collAmount, mintAmount])

	const changeTab = (newVal: number) => {
		setTab(newVal)
	}

	/** Comet Liquidity */
	const handleChangeFromAmount = useCallback( async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)

      console.log('a', amount)
      console.log('b', mintAmount)

      setCollAmount(amount)
		} else {
      setCollAmount(0.0)
		}
	}, [collAmount])

	// const handleChangeCollRatio = (event: Event, newValue: number | number[]) => {
	//   if (typeof newValue === 'number') {
	//     // TODO: to bind with contract
	//     const lowerLimit = 20
	//     const upperLimit = 160

	//     const newData = {
	//       ...cometData,
	//       collRatio: newValue,
	//       lowerLimit,
	//       upperLimit
	//     }
	//     setCometData(newData)
	//   }
	// }

	const handleChangeToAmount = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)

      console.log('c', amount)
      console.log('d', mintAmount)

			setMintAmount(amount)
		} else {
			setMintAmount(0.0)
		}
	}, [mintAmount])


	const handleChangeConcentRange = useCallback((isTight: boolean, lowerLimit: number, upperLimit: number) => {
		const newData = {
			...cometData,
			isTight,
			lowerLimit,
			upperLimit,
		}
		setCometData(newData)
	}, [cometData])

	const onComet = async () => {
    const program = getInceptApp()
    await callComet({
      program,
      userPubKey: publicKey,
      collateralIndex: 0,
      iassetIndex: assetIndex,
      usdiAmount: mintAmount,
      collateralAmount: collAmount,
    })
	}

	/** Unconcentrated Liquidity */
	const handleBorrowFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newData
		if (e.currentTarget.value && assetData) {
			const amount = parseFloat(e.currentTarget.value)
			newData = {
				...unconcentData,
				borrowFrom: amount,
				borrowTo: amount * assetData.price,
			}
		} else {
			newData = {
				...unconcentData,
				borrowFrom: 0.0,
			}
		}
		setUnconcentData(newData)
	}

	const handleBorrowTo = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newData
		if (e.currentTarget.value && assetData) {
			const amount = parseFloat(e.currentTarget.value)
			newData = {
				...unconcentData,
				borrowTo: amount,
				borrowFrom: amount / assetData.price,
			}
		} else {
			newData = {
				...unconcentData,
				borrowTo: 0.0,
			}
		}
		setUnconcentData(newData)
	}

	const onLiquidity = async () => {
		const program = getInceptApp()
		await callLiquidity({
			program,
			userPubKey: publicKey,
			iassetIndex: parseInt(assetId) - 1,
			iassetAmount: unconcentData.borrowFrom,
		})
	}

	return assetData ? (
		<StyledBox>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Box sx={{ display: 'flex' }}>
					<CometTabBtn active={tab===0} onClick={() => changeTab(0)}>
						<Image src={CometIcon} /> <span style={{ marginLeft: '8px' }}>Comet Liquidity</span>
					</CometTabBtn>
					<UnconcentTabBtn active={tab===1} onClick={() => changeTab(1)}>
						<Image src={UnconcentIcon} />
						<span style={{ marginLeft: '8px' }}>Unconcentrated Liquidity</span>
					</UnconcentTabBtn>
				</Box>
			</Box>
			<Box sx={{ paddingY: '20px' }}>
				{tab === 0 ? (
					<Box>
						<PriceIndicatorBox
							tickerIcon={assetData.tickerIcon}
							tickerName={assetData.tickerName}
							tickerSymbol={assetData.tickerSymbol}
							value={assetData.price}
						/>

						<Box sx={{ background: '#171717', paddingX: '61px', paddingY: '36px', marginTop: '28px' }}>
							<Stack
								sx={{
									border: '1px solid #00d0dd',
									borderRadius: '10px',
									color: '#9d9d9d',
									padding: '12px',
									marginBottom: '26px',
								}}
								direction="row">
								<Box sx={{ width: '73px', textAlign: 'center', marginTop: '11px' }}>
									<Image src={InfoBookIcon} />
								</Box>
								<WarningBox>
									Fill in two of the three parts and the third part will automatically generate.{' '}
									<br /> Learn more here.
								</WarningBox>
							</Stack>

							<Box>
								<SubTitle>
									<Image src={OneIcon} />{' '}
									<Box sx={{ marginLeft: '9px' }}>Provide stable coins to collateralize</Box>
								</SubTitle>
								<PairInput
									tickerIcon={'/images/assets/USDi.png'}
									tickerName="USDi Coin"
									tickerSymbol="USDi"
									value={collAmount}
									headerTitle="Balance"
									headerValue={balances?.usdiVal}
									onChange={handleChangeFromAmount}
								/>
							</Box>
							<StyledDivider />

							<Box>
								<SubTitle>
									<Image src={TwoIcon} />{' '}
									<Box sx={{ marginLeft: '9px' }}>
										Amount of USDi-{assetData.tickerSymbol} to mint into {assetData.tickerSymbol}{' '}
										AMM
									</Box>
								</SubTitle>
								{/* <Box sx={{ marginTop: '15px' }}>
                <RatioSlider min={0} max={100} value={assetData?.collRatio} onChange={handleChangeCollRatio} />
              </Box> */}
								<Box sx={{ marginBottom: '25px', marginTop: '15px' }}>
									<PairInput
										tickerIcon={'/images/assets/USDi.png'}
										tickerName="USDi Coin"
										tickerSymbol="USDi"
										value={mintAmount}
										onChange={handleChangeToAmount}
									/>
								</Box>
								<PairInputView
									tickerIcon={assetData.tickerIcon}
									tickerSymbol={assetData.tickerSymbol}
									value={mintAmount / assetData.price}
								/>
							</Box>
							<StyledDivider />

							<Box>
								<SubTitle>
									<Image src={ThreeIcon} />{' '}
									<Box sx={{ marginLeft: '9px' }}>Liquidity concentration range</Box>
								</SubTitle>

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

								<Button
									onClick={() => changeTab(1)}
									sx={{
										width: '100%',
										color: '#fff',
										background: '#171717',
										borderRadius: '10px',
										border: 'solid 1px #fff',
										marginTop: '26px',
										height: '40px',
										fontSize: '15px',
									}}>
									Unconcentrated Liquidity
								</Button>

								{assetData.tightRange > assetData.price - cometData.lowerLimit ||
								assetData.tightRange > cometData.upperLimit - assetData.price ? (
									<Stack
										sx={{
											maxWidht: '653px',
											border: '1px solid #e9d100',
											borderRadius: '10px',
											color: '#9d9d9d',
											padding: '12px',
											marginTop: '19px',
											marginBottom: '30px',
										}}
										direction="row">
										<Box sx={{ width: '53px', textAlign: 'center', marginTop: '11px' }}>
											<Image src={WarningIcon} />
										</Box>
										<WarningBox>
											Liquidity concentration range for this position is very slim, this results
											in higher potential yield and high probabily of liqudiation.
										</WarningBox>
									</Stack>
								) : (
									<></>
								)}
							</Box>
							<StyledDivider />

							<CometButton onClick={onComet}>Create Comet Position</CometButton>
						</Box>
					</Box>
				) : (
					<Box>
						<PriceIndicatorBox
							tickerIcon={assetData.tickerIcon}
							tickerName={assetData.tickerName}
							tickerSymbol={assetData.tickerSymbol}
							value={assetData.price}
						/>

						<Box sx={{ background: '#171717', paddingX: '61px', paddingY: '20px', marginTop: '28px' }}>
							<Stack
								sx={{
									border: '1px solid #e9d100',
									borderRadius: '10px',
									color: '#9d9d9d',
									padding: '12px',
									marginTop: '19px',
									marginBottom: '30px',
								}}
								direction="row">
								<Box sx={{ width: '53px', textAlign: 'center', marginTop: '11px' }}>
									<Image src={WarningIcon} />
								</Box>
								<WarningBox>
									Unconcentrated liquidity positions are less capital efficent than coment liquidity.
									Learn more here.
								</WarningBox>
							</Stack>

							<Box>
								<SubTitle>
									<Image src={OneIcon} />{' '}
									<Box sx={{ marginLeft: '9px' }}> Provide {assetData.tickerSymbol}</Box>
								</SubTitle>
								<SubTitleComment>
									Acquire {assetData.tickerSymbol} by <span style={{ color: '#fff' }}>Borrowing</span>
								</SubTitleComment>
								<PairInput
									tickerIcon={assetData.tickerIcon}
									tickerName={assetData.tickerName}
									tickerSymbol={assetData.tickerSymbol}
									value={unconcentData.borrowFrom}
									headerTitle="Balance"
									headerValue={balances?.iassetVal}
									onChange={handleBorrowFrom}
								/>
							</Box>
							<StyledDivider />

							<Box>
								<SubTitle>
									<Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}> Provide USDi</Box>
								</SubTitle>
								<SubTitleComment>An equivalent USDi amount must be provided</SubTitleComment>
								<PairInput
									tickerIcon={'/images/assets/USDi.png'}
									tickerName="USDi Coin"
									tickerSymbol="USDi"
									value={unconcentData.borrowTo}
									headerTitle="Balance"
									headerValue={balances?.usdiVal}
									onChange={handleBorrowTo}
								/>
							</Box>
							<StyledDivider />

							<LiquidityButton onClick={onLiquidity}>Create Liquidity Position</LiquidityButton>
						</Box>
					</Box>
				)}
			</Box>
		</StyledBox>
	) : <></>
}

const StyledBox = styled(Paper)`
	maxwidth: 768px;
	font-size: 14px;
	font-weight: 500;
	text-align: center;
	color: #fff;
	border-radius: 8px;
	text-align: left;
	background: #000;
	padding-left: 30px;
	padding-top: 36px;
	padding-bottom: 42px;
	padding-right: 33px;
`
const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 30px;
	margin-top: 30px;
	height: 1px;
`

const CometTabBtn = styled((props: any) => (
  <CometTab {...props} />
))(({ active }: { active: boolean}) => ({
  background: active? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),linear-gradient(to right, #00f0ff -1%, #0038ff 109%)' : '#171717'
}))

const CometTab = styled(Button)`
	width: 224px;
	height: 40px;
	padding: 9px 24px 9px 24.5px;
	border-radius: 10px;
	background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
		linear-gradient(to right, #00f0ff -1%, #0038ff 109%);
	font-size: 14px;
	font-weight: 600;
	color: #fff;
  &:hover {
    opacity: 0.8;
  }
  &:active {
    background: #171717;
  }
`

const UnconcentTabBtn = styled((props: any) => (
  <UnconcentTab {...props} />
))(({ active }: { active: boolean}) => ({
  background: active? '#3d3d3d' : '#171717'
}))

const UnconcentTab = styled(Button)`
	width: 284px;
	height: 40px;
	border-radius: 10px;
	background-color: #171717;
	font-size: 14px;
	font-weight: 600;
	color: #fff;
  &:active {
    background: #3d3d3d;
  }
`

const SubTitle = styled(Box)`
	display: flex;
	font-size: 18px;
	font-weight: 500;
`

const SubTitleComment = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #989898;
	margin-top: 10px;
`

const WarningBox = styled(Box)`
	max-width: 500px;
	padding-right: 10px;
	font-size: 14px;
	font-weight: 500;
	color: #989898;
`

const CometButton = styled(Button)`
	width: 100%;
	background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
		linear-gradient(to right, #00f0ff -1%, #0038ff 109%);
	color: #fff;
	border-radius: 10px;
	margin-bottom: 15px;
`
const LiquidityButton = styled(Button)`
	width: 100%;
	background-color: #575757;
	color: #fff;
	border-radius: 10px;
	margin-bottom: 15px;
`

export default withSuspense(AssetView, <LoadingProgress />)
