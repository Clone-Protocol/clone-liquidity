import { Box, Button, Divider, Stack, FormHelperText, Typography } from '@mui/material'
import React, { useState, useEffect, useCallback } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
// import PairInput from '~/components/Borrow/PairInput'
import PairInput from '~/components/Asset/PairInput'
import RatioSlider from '~/components/Borrow/RatioSlider'
import { useWallet } from '@solana/wallet-adapter-react'
import { useBalanceQuery } from '~/features/Comet/Balance.query'
import { ASSETS } from '~/data/assets'
import { useBorrowDetailQuery, PairData } from '~/features/MyLiquidity/BorrowPosition.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useBorrowMutation } from '~/features/Borrow/Borrow.mutation'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import SelectArrowIcon from 'public/images/keyboard-arrow-left.svg'

const RISK_RATIO_VAL = 170

const BorrowPanel = ({ assetIndex }: { assetIndex: number }) => {
  const { publicKey } = useWallet()
  // const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  // const { lAssetId } = router.query
  const fromPair: PairData = {
    tickerIcon: '/images/assets/USDi.png',
    tickerName: 'USDi Coin',
    tickerSymbol: 'USDi',
  }
  // const [assetIndex, setAssetIndex] = useState(0)
  // const [borrowAsset, setBorrowAsset] = useState(ASSETS[0])

  // sub routing for asset id
  // useEffect(() => {
  //   if (lAssetId) {
  //     setAssetIndex(parseInt(lAssetId.toString()))
  //     setBorrowAsset(ASSETS[parseInt(lAssetId.toString())])
  //   }
  // }, [lAssetId])

  const { data: borrowDetail } = useBorrowDetailQuery({
    userPubKey: publicKey,
    index: assetIndex,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  const { data: usdiBalance, refetch } = useBalanceQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  });

  const {
    handleSubmit,
    control,
    formState: { isDirty, errors },
    watch,
    setValue
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      collAmount: NaN,
      borrowAmount: NaN,
    }
  })

  const [collAmount, borrowAmount] = watch([
    'collAmount',
    'borrowAmount',
  ])

  const [collRatio, setCollRatio] = useState(100)

  const initData = () => {
    setValue('collAmount', 0.0)
    setValue('borrowAmount', 0.0)
    refetch()
  }

  const calculateBorrowAmount = (inputCollAmount: number, inputCollRatio: number) => {
    const assetOraclePrice = borrowDetail ? borrowDetail.oPrice : 1
    const borrowAmount = (inputCollAmount * 100) / (assetOraclePrice * inputCollRatio)
    setValue('borrowAmount', borrowAmount)
  }

  const calculateCollRatio = (inputBorrowAmount: number) => {
    const assetOraclePrice = borrowDetail ? borrowDetail.oPrice : 1
    setCollRatio((collAmount * 100) / (inputBorrowAmount * assetOraclePrice))
  }

  useEffect(() => {
    if (borrowDetail) {
      console.log('borrowDetail', borrowDetail)
      setCollRatio(borrowDetail.stableCollateralRatio + 30)
    }
  }, [borrowDetail])

  const { mutateAsync } = useBorrowMutation(publicKey)

  // const handleChangeAsset = useCallback((data: AssetType) => {
  //   if (data) {
  //     const index = ASSETS.findIndex((elem) => elem.tickerSymbol === data.tickerSymbol)
  //     setAssetIndex(index)
  //     setBorrowAsset(ASSETS[index])
  //     initData()
  //   }
  // }, [assetIndex, borrowAsset])

  const handleChangeCollRatio = useCallback((event: React.ChangeEvent<HTMLInputElement>, newValue: number | number[]) => {
    if (typeof newValue === 'number' && borrowDetail) {
      if (!isNaN(newValue)) {
        setCollRatio(newValue)
        calculateBorrowAmount(collAmount, newValue)
      } else {
        setCollRatio(0)
        calculateBorrowAmount(collAmount, 0)
      }

    }
  }, [collAmount, collRatio])

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
            enqueueSnackbar('Successfully established borrow position')
            setLoading(false)
            initData()
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Error establishing borrow position')
          setLoading(false)
        }
      }
    )
  }

  const isValid = Object.keys(errors).length === 0
  const hasRiskRatio = collRatio < RISK_RATIO_VAL

  return usdiBalance ? (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}

      <Box>
        <Box>
          <Box><Typography variant='p_lg'>iAsset to Borrow</Typography></Box>
          <SelectPoolBox>
            <Stack direction='row' gap={1}>
              <Image src={ASSETS[assetIndex].tickerIcon} width="27px" height="27px" />
              <Typography variant='p_xlg'>{ASSETS[assetIndex].tickerSymbol}</Typography>
            </Stack>
            <Image src={SelectArrowIcon} />
          </SelectPoolBox>
          <StyledDivider />
          <Box>
            <Box><Typography variant='p_lg'>Collateral Amount</Typography></Box>
            <Controller
              name="collAmount"
              control={control}
              rules={{
                validate(value) {
                  if (!value || value <= 0) {
                    return ''
                  } else if (value > usdiBalance?.balanceVal) {
                    return 'The collateral amount cannot exceed the balance.'
                  }
                }
              }}
              render={({ field }) => (
                <PairInput
                  tickerIcon={fromPair.tickerIcon}
                  tickerSymbol={fromPair.tickerSymbol}
                  value={parseFloat(field.value.toFixed(3))}
                  dollarPrice={0}
                  headerTitle="Balance"
                  headerValue={usdiBalance?.balanceVal}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const collAmt = parseFloat(event.currentTarget.value)
                    field.onChange(collAmt)
                    calculateBorrowAmount(collAmt, collRatio)
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

          <Box><Typography variant='p_lg'>Collateral Ratio</Typography></Box>
          <Box sx={{ marginTop: '20px' }}>
            <RatioSlider min={borrowDetail?.stableCollateralRatio} value={collRatio} hasRiskRatio={hasRiskRatio} showChangeRatio hideValueBox onChange={handleChangeCollRatio} />
          </Box>

          <StyledDivider />

          <Box>
            <Box><Typography variant='p_lg'>Borrow Amount</Typography></Box>
            <Box sx={{ marginTop: '20px' }}>
              <Controller
                name="borrowAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return ''
                    }
                  }
                }}
                render={({ field }) => (
                  <PairInput
                    tickerIcon={ASSETS[assetIndex].tickerIcon}
                    tickerSymbol={ASSETS[assetIndex].tickerSymbol}
                    value={field.value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const borrowAmt = parseFloat(event.currentTarget.value)
                      field.onChange(borrowAmt)
                      calculateCollRatio(borrowAmt)
                    }}
                  />
                )}
              />
              <FormHelperText error={!!errors.borrowAmount?.message}>{errors.borrowAmount?.message}</FormHelperText>
            </Box>
          </Box>

          <SubmitButton onClick={handleSubmit(onBorrow)} disabled={!isDirty || !isValid || borrowAmount == 0 || (borrowDetail && borrowDetail.stableCollateralRatio > collRatio)} sx={hasRiskRatio ? { backgroundColor: '#ff8e4f' } : {}}>
            <Typography variant='p_lg'>{hasRiskRatio && 'Accept Risk and '}Borrow</Typography>
          </SubmitButton>
        </Box>
      </Box>
    </>
  ) : <></>
}


const SelectPoolBox = styled(Box)`
	display: flex;
	justify-content: space-between;
	width: 175px;
	height: 45px;
	margin-top: 15px;
	margin-bottom: 28px;
  background: ${(props) => props.theme.boxes.black};
	padding: 9px;
	border: solid 1px ${(props) => props.theme.boxes.greyShade};
`
const StyledDivider = styled(Divider)`
  background-color: ${(props) => props.theme.boxes.blackShade};
  margin-bottom: 21px;
  margin-top: 21px;
  height: 1px;
`
const SubmitButton = styled(Button)`
	width: 100%;
	background-color: ${(props) => props.theme.palette.primary.main};
	color: #000;
  border-radius: 0px;
  margin-top: 25px;
	margin-bottom: 15px;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: ${(props) => props.theme.boxes.grey};
    color: #000;
  }
`

export default withSuspense(BorrowPanel, <LoadingProgress />)
