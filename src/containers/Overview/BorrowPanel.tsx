import { Box, Stack, FormHelperText, Typography } from '@mui/material'
import React, { useState, useEffect, useCallback } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import PairInput from '~/components/Asset/PairInput'
import RatioSlider from '~/components/Borrow/RatioSlider'
import { useWallet } from '@solana/wallet-adapter-react'
import { useBalanceQuery } from '~/features/Borrow/Balance.query'
import { ASSETS } from '~/data/assets'
import { PairData, DetailInfo } from '~/features/MyLiquidity/BorrowPosition.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useBorrowMutation } from '~/features/Borrow/Borrow.mutation'
import { useForm, Controller } from 'react-hook-form'
import SelectArrowIcon from 'public/images/keyboard-arrow-left.svg'
import { StyledDivider } from '~/components/Common/StyledDivider'
import { SubmitButton } from '~/components/Common/CommonButtons'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { Collateral as StableCollateral, collateralMapping } from '~/data/assets'
import dynamic from 'next/dynamic'

const RISK_RATIO_VAL = 170

const BorrowPanel = ({ assetIndex, borrowDetail, onChooseAssetIndex }: { assetIndex: number, borrowDetail: DetailInfo, onChooseAssetIndex: (index: number) => void }) => {
  const { publicKey } = useWallet()
  const onUSDInfo = collateralMapping(StableCollateral.onUSD)
  const fromPair: PairData = {
    tickerIcon: onUSDInfo.collateralIcon,
    tickerName: onUSDInfo.collateralName,
    tickerSymbol: onUSDInfo.collateralSymbol,
  }
  const ChooseAssetDialog = dynamic(() => import('~/containers/Borrow/Dialogs/ChooseAssetDialog'))

  // const { data: borrowDetail } = useBorrowDetailQuery({
  //   userPubKey: publicKey,
  //   index: assetIndex,
  //   refetchOnMount: "always",
  //   enabled: publicKey != null
  // })

  const { data: usdiBalance, refetch } = useBalanceQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  const {
    handleSubmit,
    control,
    formState: { isDirty, errors, isSubmitting },
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
  const [openChooseAsset, setOpenChooseAsset] = useState(false)

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

  const handleChooseAsset = (assetId: number) => {
    onChooseAssetIndex(assetId)
    setOpenChooseAsset(false)

    initData()
  }

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
    try {
      const data = await mutateAsync(
        {
          collateralIndex: 0,
          iassetIndex: assetIndex,
          iassetAmount: borrowAmount,
          collateralAmount: collAmount,
        }
      )

      if (data) {
        console.log('data', data)
        initData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const isValid = Object.keys(errors).length === 0
  const hasRiskRatio = collRatio < RISK_RATIO_VAL

  return usdiBalance && borrowDetail ? (
    <>
      <Box>
        <Box>
          <Box><Typography variant='p_lg'>onAsset to Borrow</Typography></Box>
          <SelectPoolBox onClick={() => setOpenChooseAsset(true)}>
            <Stack direction='row' gap={1}>
              <Image src={ASSETS[assetIndex].tickerIcon} width={27} height={27} alt={ASSETS[assetIndex].tickerSymbol} />
              <Typography variant='p_xlg'>{ASSETS[assetIndex].tickerSymbol}</Typography>
            </Stack>
            <Image src={SelectArrowIcon} alt='select' />
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

          <Box mb='10px'>
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
                    value={parseFloat(field.value.toFixed(5))}
                    dollarPrice={field.value * borrowDetail.oPrice}
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

          <SubmitButton onClick={handleSubmit(onBorrow)} disabled={!isDirty || !isValid || isSubmitting || borrowAmount == 0 || (borrowDetail && borrowDetail.stableCollateralRatio > collRatio)} sx={hasRiskRatio ? { backgroundColor: '#ff8e4f' } : {}}>
            <Typography variant='p_lg'>{hasRiskRatio && 'Accept Risk and '}Borrow</Typography>
          </SubmitButton>
        </Box>
      </Box>

      <Box display='flex' justifyContent='center'>
        <DataLoadingIndicator onRefresh={() => refetch()} />
      </Box>

      <ChooseAssetDialog
        open={openChooseAsset}
        handleChooseAsset={handleChooseAsset}
        handleClose={() => setOpenChooseAsset(false)}
      />
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
  cursor: pointer;
  background: ${(props) => props.theme.boxes.black};
	padding: 9px;
	border: solid 1px ${(props) => props.theme.boxes.greyShade};
  &:hover {
		box-shadow: 0 0 0 1px ${(props) => props.theme.palette.text.secondary} inset;
  }
`

export default withSuspense(BorrowPanel, <LoadingProgress />)
