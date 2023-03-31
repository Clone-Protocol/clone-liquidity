import React, { useState } from 'react'
import { Box, styled, Button, FormHelperText } from '@mui/material'
import PairInput from '~/components/Liquidity/unconcent/PairInput'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUnconcentDetailQuery } from '~/features/MyLiquidity/UnconcentPosition.query'
import { useDepositMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { PoolList } from '~/features/MyLiquidity/UnconcentratedPools.query'
import { SubmitButton } from '~/components/Common/CommonButtons'

const DepositPanel = ({ assetId, pool, handleClose }: { assetId: string, pool: PoolList, handleClose: () => void }) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)

  const unconcentratedIndex = parseInt(assetId)
  const { mutateAsync } = useDepositMutation(publicKey)

  const {
    handleSubmit,
    setValue,
    control,
    formState: { isDirty, errors, isSubmitting },
    watch,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      borrowFrom: NaN,
      borrowTo: NaN,
    }
  })
  const [borrowFrom, borrowTo] = watch([
    'borrowFrom',
    'borrowTo',
  ])

  const { data: unconcentData, refetch } = useUnconcentDetailQuery({
    userPubKey: publicKey,
    index: unconcentratedIndex,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  const onDeposit = async () => {
    // setLoading(true)
    await mutateAsync(
      {
        index: unconcentratedIndex,
        iassetAmount: borrowFrom
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            // enqueueSnackbar('Deposit was successful')

            refetch()
            //hacky sync
            location.reload()
          }
          // setLoading(false)
          handleClose()
        },
        onError(err) {
          console.error(err)
          // enqueueSnackbar('A deposit error occurred')
          // setLoading(false)
        }
      }
    )
  }

  const isValid = Object.keys(errors).length === 0

  return unconcentData ? (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}


      <Box>
        <Controller
          name="borrowFrom"
          control={control}
          rules={{
            validate(value) {
              if (!value || value <= 0) {
                return ''
              } else if (value > unconcentData?.iassetVal) {
                return 'The borrowing amount cannot exceed the balance.'
              }
            }
          }}
          render={({ field }) => (
            <PairInput
              tickerIcon={unconcentData.tickerIcon}
              tickerSymbol={unconcentData.tickerSymbol}
              rightHeaderTitle='Wallet Balance'
              value={parseFloat(field.value.toFixed(3))}
              valueDollarPrice={field.value * unconcentData.price}
              inputTitle='Provide more iAsset'
              balance={unconcentData?.iassetVal}
              currentAmount={pool.liquidityAsset}
              dollarPrice={pool.liquidityAsset * unconcentData.price}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                field.onChange(parseFloat(event.currentTarget.value))
                setValue('borrowTo', parseFloat(event.currentTarget.value) * unconcentData.price);
              }}
              onMax={(balance: number) => {
                field.onChange(balance)
                setValue('borrowTo', balance * unconcentData.price);
              }}
            />
          )}
        />
        <FormHelperText error={!!errors.borrowFrom?.message}>{errors.borrowFrom?.message}</FormHelperText>
      </Box>
      <Box mt='15px'>
        <Controller
          name="borrowTo"
          control={control}
          rules={{
            validate(value) {
              if (!value || value <= 0) {
                return 'the amount should be above zero.'
              } else if (value > unconcentData?.usdiVal) {
                return 'The amount cannot exceed the balance.'
              }
            }
          }}
          render={({ field }) => (
            <PairInput
              tickerIcon={'/images/assets/USDi.png'}
              tickerSymbol="USDi"
              rightHeaderTitle='Wallet Balance'
              value={parseFloat(field.value.toFixed(3))}
              valueDollarPrice={field.value}
              inputTitle='Provide more USDi'
              balance={unconcentData?.usdiVal}
              currentAmount={pool.liquidityUSD}
              dollarPrice={pool.liquidityUSD}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                field.onChange(parseFloat(event.currentTarget.value))
                setValue('borrowFrom', parseFloat(event.currentTarget.value) / unconcentData.price);
              }}
              onMax={(balance: number) => {
                field.onChange(balance)
                setValue('borrowFrom', balance / unconcentData.price);
              }}
            />
          )}
        />
        <FormHelperText error={!!errors.borrowTo?.message}>{errors.borrowTo?.message}</FormHelperText>
      </Box>
      <SubmitButton onClick={handleSubmit(onDeposit)} disabled={!isDirty || !isValid || isSubmitting}>Deposit</SubmitButton>
    </>
  ) : <></>
}

export default DepositPanel
