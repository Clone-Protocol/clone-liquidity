import { Box, Button, Paper, Divider, Grid } from '@mui/material'
import React, { useState, useCallback } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import PairInput from '~/components/Borrow/PairInput'
import AutoCompletePairInput, { AssetType } from '~/components/Borrow/AutoCompletePairInput'
// import SelectPairInput from '~/components/Borrow/SelectPairInput'
import RatioSlider from '~/components/Borrow/RatioSlider'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import OneIcon from 'public/images/one-icon.png'
import TwoIcon from 'public/images/two-icon.png'
import ThreeIcon from 'public/images/three-icon.png'
import { callBorrow } from '~/web3/Borrow/borrow'
import { useBalanceQuery } from '~/features/Comet/Balance.query'
import { ASSETS } from '~/data/assets'
import { useBorrowDetailQuery, PairData } from '~/features/MyLiquidity/BorrowPosition.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import MiniLineChartAlt from '~/components/Charts/MiniLineChartAlt'
import { useBorrowMutation } from '~/features/Borrow/Borrow.mutation'

const BorrowBox = () => {
	const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
	const { getInceptApp } = useIncept()
	const [fromPair, setFromPair] = useState<PairData>({
		tickerIcon: '/images/assets/USDi.png',
		tickerName: 'USDi Coin',
		tickerSymbol: 'USDi',	
		amount: 0.0,
	})
	const [assetIndex, setAssetIndex] = useState(0)
  const [borrowAsset, setBorrowAsset] = useState(ASSETS[0])
  const [borrowAssetPrice, setBorrowAssetPrice] = useState(160.51)
	const [borrowAmount, setBorrowAmount] = useState(0.0)
  const [collRatio, setCollRatio] = useState(250)
  const { mutateAsync } = useBorrowMutation(publicKey)

  const { data: assetData } = useBorrowDetailQuery({
    userPubKey: publicKey,
    index: assetIndex,
    refetchOnMount: true,
    enabled: publicKey != null
  })

  const { data: usdiBalance } = useBalanceQuery({ 
    userPubKey: publicKey, 
    refetchOnMount: true,
    enabled: publicKey != null
  });

	const handleChangeFrom = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = e.currentTarget.value
		if (newVal) {
			setFromPair({ ...fromPair, amount: parseFloat(newVal) })
		}
	}, [fromPair])

  const handleChangeAsset = useCallback((data: AssetType) => {
    const index = ASSETS.findIndex((elem) => elem.tickerSymbol === data.tickerSymbol)
    setAssetIndex(index)
    setBorrowAsset(ASSETS[index])
  }, [assetIndex, borrowAsset])

	const handleChangeCollRatio = useCallback((event: Event, newValue: number | number[]) => {
		if (typeof newValue === 'number') {
			setCollRatio(newValue)
      //TODO: binding web3
		}
	}, [collRatio])

	const handleChangeBorrowAmount = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = e.currentTarget.value
		if (newVal) {
			setBorrowAmount(parseFloat(newVal))
		}
	}, [borrowAmount])

	const onBorrow = async () => {
    await mutateAsync(
      {
        collateralIndex: 0,
        iassetIndex: assetIndex,
        iassetAmount: borrowAmount,
        collateralAmount: fromPair.amount,
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to borrow')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to borrow')
        }
      }
    )
	}

  const chartData = [
    {
      time: '2022-03-01',
      value: 15
    },
    {
      time: '2022-03-02',
      value: 35
    },
    {
      time: '2022-03-03',
      value: 80
    },
    {
      time: '2022-03-04',
      value: 65
    },
    {
      time: '2022-03-05',
      value: 115
    },
  ]

	return (
    <Grid container spacing={2}>
			<Grid item xs={12} md={4}>
        <AutoCompletePairInput 
          assets={ASSETS}
          selAssetId={assetIndex}
          onChangeAsset={handleChangeAsset}
        />
        <StyledBox>
          <Box display="flex">
            <Image src={borrowAsset.tickerIcon} width="30px" height="30px" />
            <Box sx={{ marginLeft: '10px', fontSize: '14px', fontWeight: '600', color: '#fff', marginTop: '3px' }}>
              {borrowAsset.tickerName} ({borrowAsset.tickerSymbol})
            </Box>
          </Box>
          <Box sx={{ marginTop: '20px', marginBottom: '27px', fontSize: '24px', fontWeight: '500', color: '#fff' }}>
            ${borrowAssetPrice.toFixed(2)}
          </Box>
          <MiniLineChartAlt 
            data={chartData}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', fontSize: '10px', color: '#6c6c6c', marginTop: '10px' }}>
            Oracle Price
          </Box>
        </StyledBox>
      </Grid>
      <Grid item xs={12} md={8}>
        <StyledPaper variant="outlined">
          <Box sx={{ fontSize: '16px', fontWeight: '600', marginBottom: '30px' }}>Borrow</Box>
          <Box>
            <SubTitle><Image src={OneIcon} /> <Box sx={{ marginLeft: '9px' }}>Choose a collateral asset</Box></SubTitle>
            <SubTitleComment>The collateral asset may affert the minimum collateral ratio.</SubTitleComment>
            <PairInput
              tickerIcon={fromPair.tickerIcon}
              tickerName={fromPair.tickerName}
              tickerSymbol={fromPair.tickerSymbol}
              value={fromPair.amount}
              balance={usdiBalance?.balanceVal}
              onChange={handleChangeFrom}
            />
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle><Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Set collateral ratio</Box></SubTitle>
            <SubTitleComment>Liquidation will be triggerd when the position’s collateral ratio is below minimum.</SubTitleComment>
            <Box sx={{ marginTop: '20px' }}>
              <RatioSlider min={100} max={250} value={collRatio} onChange={handleChangeCollRatio} />
            </Box>
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle><Image src={ThreeIcon} /> <Box sx={{ marginLeft: '9px' }}>Borrow Amount</Box></SubTitle>
            <SubTitleComment>The position can be closed when the full borrowed amount is repayed</SubTitleComment>
            <Box sx={{ marginTop: '20px' }}>
              {/* <SelectPairInput
                assets={ASSETS}
                selAssetId={assetIndex}
                value={borrowAmount}
                onChangeAsset={handleChangeAssetIdx}
                onChangeAmount={handleChangeBorrowAmount}
              /> */}
              <PairInput
                tickerIcon={ASSETS[assetIndex].tickerIcon}
                tickerName={ASSETS[assetIndex].tickerName}
                tickerSymbol={ASSETS[assetIndex].tickerSymbol}
                balanceDisabled
                value={borrowAmount}
                onChange={handleChangeBorrowAmount}
              />
            </Box>
            {/* <Stack
              sx={{
                border: '1px solid #9d9d9d',
                borderRadius: '10px',
                color: '#9d9d9d',
                padding: '12px',
                marginTop: '19px',
              }}
              direction="row"
              justifyContent="space-between">
              <Box>Price of asset bring borrowed</Box>
              <Box sx={{ display: 'flex' }}>
                <Box sx={{ marginRight: '10px' }}>
                  1 {assetData?.tickerSymbol} - {assetData?.oPrice} USDi
                </Box>
                <IconButton onClick={onRefresh}>
                  <RefreshIcon></RefreshIcon>
                </IconButton>
              </Box>
            </Stack> */}
          </Box>
          <StyledDivider />

          <ActionButton onClick={onBorrow}>Create Borrow Position</ActionButton>
        </StyledPaper>
      </Grid>
    </Grid>
	)
}

const StyledBox = styled(Box)`
  width: 315px;
  height: 290px;
  padding: 17px 34px 18px 35px;
  border-radius: 10px;
  background: #171717;
  margin-top: 22px;
`

const StyledPaper = styled(Paper)`
	width: 620px;
	font-size: 14px;
	font-weight: 500;
	text-align: center;
	color: #fff;
	border-radius: 8px;
	text-align: left;
	background: #171717;
	padding-left: 36px;
	padding-top: 26px;
	padding-bottom: 32px;
	padding-right: 36px;
`
const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 39px;
	margin-top: 39px;
	height: 1px;
`

const SubTitle = styled('div')`
  display: flex;
	font-size: 14px;
	font-weight: 500;
	margin-bottom: 12px;
`

const SubTitleComment = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
`

const IconButton = styled('div')`
	width: 22px;
	height: 22px;
	background: #00f0ff;
	color: #000;
  cursor: pointer;
  border-radius: 20px;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #4e609f;
  font-size: 13px;
	color: #fff;
	border-radius: 8px;
	margin-bottom: 15px;
`

export default withSuspense(BorrowBox, <LoadingProgress />)
