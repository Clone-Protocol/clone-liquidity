import React from 'react'
import { Box, FormHelperText } from '@mui/material'
import PairInput from '~/components/Liquidity/unconcent/PairInput'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUnconcentDetailQuery } from '~/features/MyLiquidity/UnconcentPosition.query'
import { useDepositMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import { useForm, Controller } from 'react-hook-form'
import { PoolList } from '~/features/MyLiquidity/UnconcentratedPools.query'
import { SubmitButton } from '~/components/Common/CommonButtons'

const DepositPanel = ({ assetId, pool, handleClose }: { assetId: string, pool: PoolList, handleClose: () => void }) => {
  const { publicKey } = useWallet()
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
    try {
      const data = await mutateAsync(
        {
          index: unconcentratedIndex,
          iassetAmount: borrowFrom
        }
      )

      if (data) {
        console.log('data', data)
        refetch()
        handleClose()
        //hacky sync
        location.reload()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const isValid = Object.keys(errors).length === 0

  return unconcentData ? (
    <>
      <Box>
        <Controller
          name="borrowFrom"
          control={control}
          rules={{
            validate(value) {
              if (!value || value <= 0) {
                return ''
              } else if (value > unconcentData?.iassetVal) {
                return 'The deposit amount cannot exceed the balance.'
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
              inputTitle='Provide more onAsset'
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
              tickerIcon={'/images/assets/on-usd.png'}
              tickerSymbol="onUSD"
              rightHeaderTitle='Wallet Balance'
              value={parseFloat(field.value.toFixed(3))}
              valueDollarPrice={field.value}
              inputTitle='Provide more onUSD'
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
      <SubmitButton onClick={handleSubmit(onDeposit)} disabled={!isDirty || !isValid || isSubmitting || unconcentData?.iassetVal === 0}>Deposit</SubmitButton>
    </>
  ) : <></>
}

export default DepositPanel
