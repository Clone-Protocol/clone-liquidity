import React, { useState } from 'react'
import { Box, styled, Button, FormHelperText, Typography } from '@mui/material'
import PairInput from '~/components/Liquidity/unconcent/PairInput'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUnconcentDetailQuery } from '~/features/MyLiquidity/UnconcentPosition.query'
import { useDepositMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { PoolList } from '~/features/MyLiquidity/UnconcentratedPools.query'

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
    formState: { isDirty, errors },
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
    enabled: open && publicKey != null
  })

  const onDeposit = async () => {
    setLoading(true)
    handleClose()
    await mutateAsync(
      {
        index: unconcentratedIndex,
        iassetAmount: borrowFrom
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Deposit was successful')

            refetch()
            //hacky sync
            location.reload()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('A deposit error occurred')
          setLoading(false)
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
              value={parseFloat(field.value.toFixed(3))}
              valueDollarPrice={field.value * unconcentData.price}
              inputTitle='Provide more iAsset'
              balance={unconcentData?.iassetVal}
              currentAmount={pool.liquidityAsset}
              dollarPrice={pool.liquidityAsset * unconcentData.price}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
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
              value={parseFloat(field.value.toFixed(3))}
              valueDollarPrice={field.value}
              inputTitle='Provide more USDi'
              balance={unconcentData?.usdiVal}
              currentAmount={pool.liquidityUSD}
              dollarPrice={pool.liquidityUSD}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
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
      <ActionButton onClick={handleSubmit(onDeposit)} disabled={!isDirty || !isValid}>Deposit</ActionButton>
    </>
  ) : <></>
}

const ActionButton = styled(Button)`
  width: 100%;
  background-color: ${(props) => props.theme.palette.primary.main};
  color: #000;
  border-radius: 0px;
  margin-top: 15px;
  margin-bottom: 15px;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: ${(props) => props.theme.boxes.grey};
    color: #000;
  }
`

export default DepositPanel
