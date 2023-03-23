import { Box, Stack, Button, FormHelperText, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
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
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { StyledDivider } from '~/components/Common/StyledDivider'

const UnconcentPanel = ({ balances, assetData, assetIndex, onRefetchData }: { balances: Balance, assetData: PositionInfo, assetIndex: number, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { mutateAsync: mutateAsyncLiquidity } = useLiquidityMutation(publicKey)
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
    setLoading(true)
    await mutateAsyncLiquidity(
      {
        iassetIndex: assetIndex,
        iassetAmount: borrowFrom,
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Successfully established unconcentrated liquidity position')
            setLoading(false)
            initData()
            router.push('/liquidity?ltab=2')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Error establishing unconcentrated liquidity position')
          setLoading(false)
        }
      }
    )
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
      return 'The borrowing amount cannot exceed the balance.'
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
      return 'the amount should be above zero.'
    } else if (borrowTo > balances?.usdiVal) {
      return 'The amount cannot exceed the balance.'
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
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}

      <Box>
        <Box>
          <WarningStack direction="row">
            <Image src={LightBulbIcon} />
            <Typography variant='p' ml='8px'>Unconcentrated positions are capital less efficient compared to any Comet positions</Typography>
          </WarningStack>
          <Box>
            <Box>
              <Typography variant='p_lg'>Provide iAsset</Typography>
            </Box>
            {/* <SubTitleComment>
              Acquire {assetData.tickerSymbol} by <Link href={`/borrow?lAssetId=${assetIndex}`}><span style={{ color: '#fff', cursor: 'pointer' }}>Borrowing</span></Link>
            </SubTitleComment> */}
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
                  dollarPrice={0}
                  headerTitle="Wallet Balance"
                  headerValue={balances?.iassetVal}
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) => onBorrowFromInputChange(parseFloat(evt.currentTarget.value), field)}
                  onMax={(value: number) => onBorrowFromInputChange(value, field)}
                />
              )}
            />
            <FormHelperText error={!!errors.borrowFrom?.message}>{errors.borrowFrom?.message}</FormHelperText>
          </Box>

          <StyledDivider />

          <Box>
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
                  dollarPrice={0}
                  headerTitle="Wallet Balance"
                  headerValue={balances?.usdiVal}
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                    onBorrowToInputChange(parseFloat(evt.currentTarget.value), field)
                  }}
                  onMax={(value: number) => onBorrowToInputChange(value, field)}
                />
              )}
            />
            <FormHelperText error={!!errors.borrowTo?.message}>{errors.borrowTo?.message}</FormHelperText>
          </Box>
          <StyledDivider />

          <LiquidityButton onClick={handleSubmit(onFormSubmit)} disabled={disableSubmitButton() || isSubmitting}>Open Unconcentrated Position</LiquidityButton>
        </Box>
      </Box>
    </>
  )
}

const WarningStack = styled(Stack)`
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  padding-top: 5px;
  padding-bottom: 5px;
  border: 1px solid ${(props) => props.theme.palette.text.secondary};
  color: ${(props) => props.theme.palette.text.secondary};
`
const LiquidityButton = styled(Button)`
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

export default withSuspense(UnconcentPanel, <LoadingProgress />)
