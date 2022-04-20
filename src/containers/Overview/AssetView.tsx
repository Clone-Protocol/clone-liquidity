import { Box, Stack, Button, Paper, Divider } from '@mui/material'
import React, { useState, useEffect, useCallback } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import PairInput from '~/components/Asset/PairInput'
import PairInputView from '~/components/Asset/PairInputView'
import RatioSlider from '~/components/Borrow/RatioSlider'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import ConcentrationRangeBox from '~/components/Liquidity/comet/ConcentrationRangeBox'
import InfoBookIcon from 'public/images/info-book-icon.png'
import WarningIcon from 'public/images/warning-icon.png'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { useBalanceQuery } from '~/features/Borrow/Balance.query'
import OneIcon from 'public/images/one-icon.png'
import TwoIcon from 'public/images/two-icon.png'
import ThreeIcon from 'public/images/three-icon.png'
import CometIcon from 'public/images/comet-icon.png'
import UnconcentIcon from 'public/images/ul-icon.png'
import { useInitCometDetailQuery, CometInfo } from '~/features/MyLiquidity/CometPosition.query'
import { UnconcentratedData as UnconcentPI } from '~/web3/MyLiquidity/UnconcentPosition'
import { useCometMutation } from '~/features/Comet/Comet.mutation'
import { useLiquidityMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'

const AssetView = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
  const { enqueueSnackbar } = useSnackbar()
	const [tab, setTab] = useState(0)
  const assetIndex = parseInt(assetId)

  const [cometData, setCometData] = useState<CometInfo>({
    isTight: false,
    collRatio: 50,
    lowerLimit: 40.0,
    upperLimit: 180.0
  })
  const [collAmount, setCollAmount] = useState(0.0)
  const [mintAmount, setMintAmount] = useState(0.0)

  const { mutateAsync: mutateAsyncComet } = useCometMutation(publicKey)

	//unconcentrated liquidity
	const [unconcentData, setUnconcentData] = useState<UnconcentPI>({
    borrowFrom: 0.0,
    borrowTo: 0.0,
  })
  const { mutateAsync: mutateAsyncLiquidity } = useLiquidityMutation(publicKey)

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

	const handleChangeCollRatio = useCallback( async (event: Event, newValue: number | number[]) => {
	  if (typeof newValue === 'number') {
	    // TODO: to bind with contrac	    

	    const newData = {
	      ...cometData,
	      collRatio: newValue
	    }
	    setCometData(newData)
	  }
	}, [cometData])

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
    await mutateAsyncComet(
      {
        collateralIndex: 0,
        iassetIndex: assetIndex,
        usdiAmount: mintAmount,
        collateralAmount: collAmount,
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to comet')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to comet')
        }
      }
    )
	}

	/** Unconcentrated Liquidity */
	const handleBorrowFrom = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
	}, [unconcentData])

	const handleBorrowTo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
	}, [unconcentData])

	const onLiquidity = async () => {
    await mutateAsyncLiquidity(
      {
        iassetIndex: assetIndex,
			  iassetAmount: unconcentData.borrowFrom,
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to liquidity')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to liquidity')
        }
      }
    )
	}

	return assetData ? (
		<StyledBox>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Box sx={{ display: 'flex', maxWidth: '488px', height: '47px', alignItems: 'center', paddingLeft: '9px', borderRadius: '10px', background: 'rgba(21, 22, 24, 0.75)' }}>
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

						<Box sx={{ background: '#171717', paddingX: '32px', paddingY: '24px', marginTop: '28px', borderRadius: '10px' }}>
							<Stack
								sx={{
									border: '1px solid #809cff',
									borderRadius: '10px',
									color: '#809cff',
									padding: '12px',
									marginBottom: '26px',
								}}
								direction="row">
								<Box sx={{ width: '73px', textAlign: 'center', marginTop: '6px' }}>
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
                <Box sx={{ marginTop: '15px' }}>
                  <RatioSlider min={0} max={100} value={cometData?.collRatio} hideValueBox onChange={handleChangeCollRatio} />
                </Box>
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

								<ConcentrationRangeBox assetData={assetData} cometData={cometData} />

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

						<Box sx={{ background: '#171717', paddingX: '32px', paddingY: '24px', marginTop: '28px', borderRadius: '10px' }}>
							<Stack
								sx={{
									border: '1px solid #e9d100',
									borderRadius: '10px',
									color: '#9d9d9d',
									padding: '12px',
									marginTop: '10px',
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

							<LiquidityButton onClick={onLiquidity}>Create Unconcentrated Liquidity Position</LiquidityButton>
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
  border: active? '1px solid #0038ff' : '',
}))

const CometTab = styled(Button)`
	width: 199px;
	height: 35px;
	padding: 9px 24px 9px 24.5px;
	border-radius: 10px;
	background-color: rgba(21, 22, 24, 0.75);
	font-size: 12px;
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
  border: active? '1px solid #444' : '',
}))

const UnconcentTab = styled(Button)`
	width: 264px;
	height: 35px;
  margin-left: 8px;
	border-radius: 10px;
	background-color: rgba(21, 22, 24, 0.75);
	font-size: 12px;
	font-weight: 600;
	color: #fff;
  &:active {
    background: #3d3d3d;
  }
`

const SubTitle = styled(Box)`
	display: flex;
	font-size: 14px;
	font-weight: 500;
`

const SubTitleComment = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
	margin-top: 10px;
`

const WarningBox = styled(Box)`
	max-width: 500px;
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
`

const CometButton = styled(Button)`
	width: 100%;
	background-color: #4e609f;
	color: #fff;
	border-radius: 10px;
	margin-bottom: 15px;
  font-size: 13px;
  font-weight: 600;
`
const LiquidityButton = styled(Button)`
	width: 100%;
  background-color: #4e609f;
	color: #fff;
  font-size: 13px;
	border-radius: 10px;
	margin-bottom: 15px;
`

export default withSuspense(AssetView, <LoadingProgress />)
