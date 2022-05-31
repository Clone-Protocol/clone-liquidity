import { Box, Button, Paper, Divider, Grid, FormHelperText } from '@mui/material'
import React, { useState, useEffect, useCallback } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import PairInput from '~/components/Borrow/PairInput'
import AutoCompletePairInput, { AssetType } from '~/components/Borrow/AutoCompletePairInput'
// import SelectPairInput from '~/components/Borrow/SelectPairInput'
import RatioSlider from '~/components/Borrow/RatioSlider'
import { useWallet } from '@solana/wallet-adapter-react'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import ThreeIcon from 'public/images/three-icon.svg'
import { useBalanceQuery } from '~/features/Comet/Balance.query'
import { ASSETS } from '~/data/assets'
import { useBorrowDetailQuery, PairData } from '~/features/MyLiquidity/BorrowPosition.query'
import { usePriceHistoryQuery } from '~/features/Chart/PriceByAsset.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import MiniLineChartAlt from '~/components/Charts/MiniLineChartAlt'
import { useBorrowMutation } from '~/features/Borrow/Borrow.mutation'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'

const BorrowBox = () => {
	const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const fromPair: PairData = {
    tickerIcon: '/images/assets/USDi.png',
		tickerName: 'USDi Coin',
		tickerSymbol: 'USDi',	
  }
	const [assetIndex, setAssetIndex] = useState(0)
  const [borrowAsset, setBorrowAsset] = useState(ASSETS[0])

  const { data: priceHistory } = usePriceHistoryQuery({
    tickerSymbol: borrowAsset?.tickerSymbol,
    refetchOnMount: false,
    enabled: borrowAsset != null
  })

  const { data: borrowDetail } = useBorrowDetailQuery({
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

  // TODO:
  const [collRatio, setCollRatio] = useState(100)

  useEffect(() => {
    if (borrowDetail) {
      setCollRatio(borrowDetail.stableCollateralRatio)
    }
  }, [borrowDetail])

  const { mutateAsync } = useBorrowMutation(publicKey)

  const {
		handleSubmit,
		control,
		formState: { isDirty, errors },
		watch,
    setValue
	} = useForm({
    mode: 'onChange',
    defaultValues: {
      collAmount: 0.0,
      borrowAmount: 0.0,
    }
	})
  
  const [collAmount, borrowAmount] = watch([
		'collAmount',
		'borrowAmount',
	])

  const handleChangeAsset = useCallback((data: AssetType) => {
    if (data) {
      const index = ASSETS.findIndex((elem) => elem.tickerSymbol === data.tickerSymbol)
      setAssetIndex(index)
      setBorrowAsset(ASSETS[index])
    }
  }, [assetIndex, borrowAsset])

	const handleChangeCollRatio = useCallback((event: Event, newValue: number | number[]) => {
		if (typeof newValue === 'number') {
			setCollRatio(newValue)
		}
	}, [collRatio])

	const onBorrow = async () => {
    setLoading(true)
    await mutateAsync(
      {
        collateralIndex: 0,
        iassetIndex: assetIndex,
        iassetAmount: borrowAmount,
        collateralAmount: collAmount,
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to borrow')
            setLoading(false)
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to borrow')
          setLoading(false)
        }
      }
    )
	}

  const isValid = Object.keys(errors).length === 0

	return priceHistory && usdiBalance ? (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

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
            <Box sx={{ marginTop: '10px', marginBottom: '27px', fontSize: '24px', fontWeight: '500', color: '#fff' }}>
              ${priceHistory.assetPrice.toFixed(2)}
              {priceHistory.rateOfPrice >= 0 ?
                <TxtPriceRate>+${priceHistory.rateOfPrice.toFixed(3)} (+{priceHistory.percentOfRate}%) past 24h</TxtPriceRate>
              :
                <TxtPriceRate style={{ color: '#ec5e2a' }}>-${Math.abs(priceHistory.rateOfPrice).toFixed(3)} (-{priceHistory.percentOfRate}%) past 24h</TxtPriceRate>
              }
            </Box>
            <MiniLineChartAlt 
              data={priceHistory?.chartData}
              color={ priceHistory.rateOfPrice >= 0 ? '#59c23a' : '#ec5e2a'}
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
              <Controller
                name="collAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return 'the collateral amount should be above zero.'
                    } else if (value > usdiBalance?.balanceVal) {
                      return 'The collateral amount cannot exceed the balance.'
                    }
                  }
                }}
                render={({ field }) => (
                  <PairInput
                    tickerIcon={fromPair.tickerIcon}
                    tickerName={fromPair.tickerName}
                    tickerSymbol={fromPair.tickerSymbol}
                    value={field.value}
                    balance={usdiBalance?.balanceVal}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(parseFloat(event.currentTarget.value))
                    }}
                    onMax={(balance: number) => {
                      field.onChange(balance)
                    }}
                  />
                )}
              />
              <FormHelperText error={!!errors.collAmount?.message}>{errors.collAmount?.message}</FormHelperText>
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
                <Controller
                  name="borrowAmount"
                  control={control}
                  rules={{
                    validate(value) {
                      if (!value || value <= 0) {
                        return 'the borrow amount should be above zero.'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <PairInput
                      tickerIcon={ASSETS[assetIndex].tickerIcon}
                      tickerName={ASSETS[assetIndex].tickerName}
                      tickerSymbol={ASSETS[assetIndex].tickerSymbol}
                      balanceDisabled
                      value={field.value}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        field.onChange(parseFloat(event.currentTarget.value))
                      }}
                    />
                  )}
                />
                <FormHelperText error={!!errors.borrowAmount?.message}>{errors.borrowAmount?.message}</FormHelperText>
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

            <ActionButton onClick={handleSubmit(onBorrow)} disabled={!isDirty || !isValid}>Create Borrow Position</ActionButton>
          </StyledPaper>
        </Grid>
      </Grid>
    </>
	) : <></>
}

const StyledBox = styled(Box)`
  width: 315px;
  height: 290px;
  padding: 17px 34px 18px 35px;
  border-radius: 10px;
  background: rgba(21, 22, 24, 0.75);
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
	background: rgba(21, 22, 24, 0.75);
	padding-left: 36px;
	padding-top: 26px;
	padding-bottom: 32px;
	padding-right: 36px;
`
const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 30px;
	margin-top: 30px;
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

const TxtPriceRate = styled('div')`
  font-size: 10px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: #59c23a;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #4e609f;
  font-size: 13px;
	color: #fff;
	border-radius: 8px;
	margin-bottom: 15px;
  &:disabled {
    background-color: #444;
    color: #adadad;
  } 
`

export default withSuspense(BorrowBox, <LoadingProgress />)
