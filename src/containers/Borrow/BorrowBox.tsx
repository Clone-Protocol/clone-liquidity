import { Box, Stack, Button, Paper, Divider, Grid } from '@mui/material'
import React, { useState } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import PairInput from '~/components/Borrow/PairInput'
import AutoCompletePairInput, { AssetType } from '~/components/Borrow/AutoCompletePairInput'
import SelectPairInput from '~/components/Borrow/SelectPairInput'
// import RatioSlider from '~/components/Borrow/RatioSlider'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import OneIcon from 'public/images/one-icon.png'
import TwoIcon from 'public/images/two-icon.png'
import { callBorrow } from '~/web3/Borrow/borrow'
import { useBalanceQuery } from '~/features/Comet/Balance.query'
import { ASSETS } from '~/data/assets'
import { useBorrowDetailQuery, PairData } from '~/features/MyLiquidity/BorrowPosition.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'

const BorrowBox = () => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
	const [fromPair, setFromPair] = useState<PairData>({
		tickerIcon: '/images/assets/USDi.png',
		tickerName: 'USDi Coin',
		tickerSymbol: 'USDi',	
		amount: 0.0,
	})
	// const [collRatio, setCollRatio] = useState(250)
	const [assetIndex, setAssetIndex] = useState(0)
	const [borrowAmount, setBorrowAmount] = useState(0.0)

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

	const handleChangeFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = e.currentTarget.value
		if (newVal) {
			setFromPair({ ...fromPair, amount: parseFloat(newVal) })
		}
	}

  const handleChangeAsset = (data: AssetType) => {
    const index = ASSETS.findIndex((elem) => elem.tickerSymbol === data.tickerSymbol)
    setAssetIndex(index)
  }

	const handleChangeAssetIdx = (index: number) => {
		setAssetIndex(index)
	}

	// const handleChangeCollRatio = (event: Event, newValue: number | number[]) => {
	// 	if (typeof newValue === 'number') {
	// 		setCollRatio(newValue)
	// 	}
	// }

	const handleChangeBorrowAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = e.currentTarget.value
		if (newVal) {
			setBorrowAmount(parseFloat(newVal))
		}
	}

	const onBorrow = async () => {
		const program = getInceptApp()
		await callBorrow({
			program,
			userPubKey: publicKey,
			collateralIndex: 0,
			iassetIndex: assetIndex,
			iassetAmount: borrowAmount,
			collateralAmount: fromPair.amount,
		})
	}

	return (
    <Grid container spacing={2}>
			<Grid item xs={12} md={4}>
        <AutoCompletePairInput 
          assets={ASSETS}
          selAssetId={assetIndex}
          onChangeAsset={handleChangeAsset}
        />
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

          {/* <Box>
            <SubTitle>(2) Set collateral ratio</SubTitle>
            <SubTitleComment>Liquidation will be triggerd when the position’s collateral ratio is below minimum.</SubTitleComment>
            <Box sx={{ marginTop: '20px' }}>
              <RatioSlider min={0} max={500} value={collRatio} onChange={handleChangeCollRatio} />
            </Box>
          </Box>
          <StyledDivider /> */}

          <Box>
            <SubTitle><Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Borrow Amount</Box></SubTitle>
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
