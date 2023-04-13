import { Box, Stack, FormHelperText, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import Image from 'next/image'
import PairInput from '~/components/Asset/PairInput'
import LightBulbIcon from 'public/images/lightbulb-outline.svg'
import { useWallet } from '@solana/wallet-adapter-react'
import { useLiquidityMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import { PositionInfo } from '~/features/MyLiquidity/CometPosition.query'
import { Balance } from '~/features/Borrow/Balance.query'
import { useRouter } from 'next/router'
import { useForm, Controller, ControllerRenderProps, FieldValues } from 'react-hook-form'
import { SubmitButton } from '~/components/Common/CommonButtons'

const UnconcentPanel = ({ balances, assetData, assetIndex, onRefetchData }: { balances: Balance, assetData: PositionInfo, assetIndex: number, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const router = useRouter()
  const { mutateAsync } = useLiquidityMutation(publicKey)
  const [borrowFrom, setBorrowFrom] = useState(NaN)
  const [borrowTo, setBorrowTo] = useState(NaN)
  const {
    control,
    trigger,
    clearErrors,
    formState: { isDirty, errors, isSubmitting },
    handleSubmit
  } = useForm({ mode: 'onChange' })

  const initData = () => {
    setBorrowFrom(0.0)
    setBorrowTo(0.0)
    onRefetchData()
  }

  const onLiquidity = async () => {
    try {
      const data = await mutateAsync(
        {
          iassetIndex: assetIndex,
          iassetAmount: borrowFrom,
        }
      )
      if (data) {
        console.log('data', data)
        initData()
        router.push('/liquidity?ltab=2')
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    async function triggerValidation() {
      await trigger()
    }
    triggerValidation()
  }, [borrowFrom, borrowTo])

  const onBorrowToInputChange = (currentValue: number, field: ControllerRenderProps<FieldValues, "borrowTo">) => {
    setBorrowTo(currentValue)
    field.onChange(currentValue)
    setBorrowFrom(currentValue / assetData.price)
  }

  const onBorrowFromInputChange = (currentValue: number, field: ControllerRenderProps<FieldValues, "borrowFrom">) => {
    field.onChange(currentValue)
    setBorrowFrom(currentValue)
    setBorrowTo(currentValue * assetData.price)
  }

  const validateBorrowFrom = () => {
    if (isNaN(borrowFrom)) {
      clearErrors('borrowFrom')
      return
    } else if (borrowFrom > balances?.iassetVal) {
      return 'Provided amount cannot exceed wallet balance'
    }

    clearErrors('borrowFrom')
    return
  }


  const validateBorrowTo = () => {
    if (!isDirty) {
      clearErrors('borrowTo')
      return
    }

    if (!borrowTo || borrowTo <= 0) {
      return 'Provided amount cannot exceed wallet balance'
    } else if (borrowTo > balances?.usdiVal) {
      return 'Provided amount cannot exceed wallet balance'
    }

    clearErrors('borrowTo')
  }

  const formHasErrors = (): boolean => {
    if ((errors.borrowTo && errors.borrowTo.message !== "") || (errors.borrowFrom && errors.borrowFrom.message !== "")) {
      return true
    }
    return false
  }

  const disableSubmitButton = (): boolean => {
    if (!isDirty || formHasErrors()) {
      return true
    }
    return false
  }

  const onFormSubmit = async () => {
    await onLiquidity()
  }

  return (
    <>
      <Box>
        <Box>
          <WarningStack direction="row">
            <Image src={LightBulbIcon} />
            <Typography variant='p' ml='8px'>Unconcentrated positions are capital less efficient compared to any Comet positions</Typography>
          </WarningStack>
          <Box mb='15px'>
            <Box>
              <Typography variant='p_lg'>Provide iAsset</Typography>
            </Box>
            <Controller
              name="borrowFrom"
              control={control}
              rules={{
                validate() {
                  return validateBorrowFrom()
                }
              }}
              render={({ field }) => (
                <PairInput
                  tickerIcon={assetData.tickerIcon}
                  tickerSymbol={assetData.tickerSymbol}
                  value={isNaN(borrowFrom) ? "" : borrowFrom}
                  dollarPrice={borrowFrom * assetData.price}
                  headerTitle="Wallet Balance"
                  headerValue={balances?.iassetVal}
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) => onBorrowFromInputChange(parseFloat(evt.currentTarget.value), field)}
                  onMax={(value: number) => onBorrowFromInputChange(value, field)}
                />
              )}
            />
            <FormHelperText sx={{ textAlign: 'right' }} error={!!errors.borrowFrom?.message}>{errors.borrowFrom?.message}</FormHelperText>
          </Box>

          <Box mb='15px'>
            <Box>
              <Typography variant='p_lg'>Provide USDi</Typography>
            </Box>
            <Controller
              name="borrowTo"
              control={control}
              rules={{
                validate() {
                  return validateBorrowTo()
                }
              }}
              render={({ field }) => (
                <PairInput
                  tickerIcon={'/images/assets/USDi.png'}
                  tickerSymbol="USDi"
                  value={isNaN(borrowTo) ? "" : borrowTo}
                  headerTitle="Wallet Balance"
                  headerValue={balances?.usdiVal}
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                    onBorrowToInputChange(parseFloat(evt.currentTarget.value), field)
                  }}
                  onMax={(value: number) => onBorrowToInputChange(value, field)}
                />
              )}
            />
            <FormHelperText sx={{ textAlign: 'right' }} error={!!errors.borrowTo?.message}>{errors.borrowTo?.message}</FormHelperText>
          </Box>

          <SubmitButton onClick={handleSubmit(onFormSubmit)} sx={{ marginTop: '5px' }} disabled={disableSubmitButton() || isSubmitting}>Open Unconcentrated Position</SubmitButton>
        </Box>
      </Box>
    </>
  )
}

const WarningStack = styled(Stack)`
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  padding-top: 8px;
  padding-bottom: 8px;
  border: 1px solid ${(props) => props.theme.palette.text.secondary};
  color: ${(props) => props.theme.palette.text.secondary};
`

export default withSuspense(UnconcentPanel, <LoadingProgress />)
