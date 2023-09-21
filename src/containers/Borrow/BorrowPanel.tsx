import { Box, Stack, FormHelperText, Typography } from '@mui/material'
import React, { useState, useEffect, useCallback } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import PairInput from '~/components/Asset/PairInput'
import RatioSlider from '~/components/Borrow/RatioSlider'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useWallet } from '@solana/wallet-adapter-react'
import { useBalanceQuery } from '~/features/Borrow/Balance.query'
import { ASSETS } from '~/data/assets'
import { PairData, DetailInfo } from '~/features/MyLiquidity/BorrowPosition.query'
import { useBorrowMutation } from '~/features/Borrow/Borrow.mutation'
import { useForm, Controller } from 'react-hook-form'
import SelectArrowIcon from 'public/images/keyboard-arrow-left.svg'
import { SubmitButton } from '~/components/Common/CommonButtons'
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
      setCollRatio(borrowDetail.minCollateralRatio + 30)
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
          onassetIndex: assetIndex,
          onassetAmount: borrowAmount,
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
  const hasLowerMin = collRatio < borrowDetail?.minCollateralRatio;

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
          <Box>
            <Box mb='15px'><Typography variant='p_lg'>Collateral Amount</Typography></Box>
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
                  dollarPrice={field.value * borrowDetail.oPrice}
                  inputTitle='Collateral'
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

          <Box my='25px'><Typography variant='p_lg'>Collateral Ratio</Typography></Box>
          <Box>
            <RatioSlider min={borrowDetail?.minCollateralRatio} value={collRatio} hasRiskRatio={hasRiskRatio} hasLowerMin={hasLowerMin} showChangeRatio hideValueBox onChange={handleChangeCollRatio} />
          </Box>

          <Box mb='10px'>
            <Box mt='25px' mb='15px'><Typography variant='p_lg'>Borrow Amount</Typography></Box>
            <Box>
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
                    disabledInput
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

          {hasRiskRatio &&
            <WarningStack direction='row'>
              <WarningAmberIcon sx={{ color: '#ff0084', width: '15px' }} />
              <Typography variant='p' ml='8px'>Due to low collateral ratio, this borrow position will have high possibility to become subject to liquidation. Click to learn more about our liquidation process.</Typography>
            </WarningStack>
          }

          <SubmitButton onClick={handleSubmit(onBorrow)} disabled={!isDirty || !isValid || isSubmitting || borrowAmount == 0 || (borrowDetail && borrowDetail.minCollateralRatio > collRatio)} sx={hasRiskRatio ? { backgroundColor: '#ff0084' } : {}}>
            <Typography variant='p_lg'>{hasLowerMin ? 'Minimum Collateral Ratio is 150%' : hasRiskRatio ? 'Accept Risk and Open Borrow Position' : 'Borrow'}</Typography>
          </SubmitButton>
        </Box>
      </Box>

      <ChooseAssetDialog
        open={openChooseAsset}
        handleChooseAsset={handleChooseAsset}
        handleClose={() => setOpenChooseAsset(false)}
      />
    </>
  ) : <><Typography variant='p_lg'>Please Connect Wallet</Typography></>
}


const SelectPoolBox = styled(Box)`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 145px;
	height: 40px;
	background-color: rgba(37, 141, 237, 0.15);
	border-radius: 5px;
	cursor: pointer;
	padding: 8px;
  margin-top: 15px;
  margin-bottom: 25px;
	&:hover {
		box-shadow: 0 0 0 1px ${(props) => props.theme.basis.liquidityBlue} inset;
		background-color: rgba(37, 141, 237, 0.23);
  }
`
const SelectDefaultPool = styled(Box)`
  width: 134px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 5px;
  cursor: pointer;
  border: solid 1px ${(props) => props.theme.basis.shadowGloom};
  background-color: ${(props) => props.theme.basis.jurassicGrey};
  &:hover {
		box-shadow: 0 0 0 1px ${(props) => props.theme.basis.liquidityBlue} inset;
  }
`
const WarningStack = styled(Stack)`
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  padding: 13px;
  border-radius: 5px;
  background-color: rgba(255, 0, 214, 0.15);
  color: #ff0084;
`

export default BorrowPanel
