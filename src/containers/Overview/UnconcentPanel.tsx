import { Box, Stack, Button, Divider, FormHelperText } from '@mui/material'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import Image from 'next/image'
import PairInput from '~/components/Asset/PairInput'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import WarningIcon from 'public/images/warning-icon.png'
import { useWallet } from '@solana/wallet-adapter-react'
import { useLiquidityMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import { PositionInfo } from '~/features/MyLiquidity/CometPosition.query'
import { Balance } from '~/features/Borrow/Balance.query'
import { useRouter } from 'next/router'
import { useForm, Controller, ControllerRenderProps, FieldValues } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'

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
            router.push('/liquidity?ltab=1')
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
        <PriceIndicatorBox
          tickerIcon={assetData.tickerIcon}
          tickerName={assetData.tickerName}
          tickerSymbol={assetData.tickerSymbol}
          value={assetData.price}
        />

        <StyledBox>
          <WarningStack direction="row">
            <IconWrapper>
              <Image src={WarningIcon} />
            </IconWrapper>
            <WarningBox>
              Unconcentrated liquidity positions are less capital efficent than coment liquidity. <br />
              Learn more <span style={{ textDecoration: 'underline' }}>here</span>.
            </WarningBox>
          </WarningStack>
          <Box>
            <SubTitle>
              <Image src={OneIcon} />{' '}
              <Box marginLeft='9px'> Provide {assetData.tickerSymbol}</Box>
            </SubTitle>
            <SubTitleComment>
              Acquire {assetData.tickerSymbol} by <Link href={`/borrow?lAssetId=${assetIndex}`}><span style={{ color: '#fff', cursor: 'pointer' }}>Borrowing</span></Link>
            </SubTitleComment>
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
                  headerTitle="Balance"
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
            <SubTitle>
              <Image src={TwoIcon} /> <Box marginLeft='9px'> Provide USDi</Box>
            </SubTitle>
            <SubTitleComment>An equivalent USDi amount must be provided</SubTitleComment>
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
                  headerTitle="Balance"
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

          <LiquidityButton onClick={handleSubmit(onFormSubmit)} disabled={disableSubmitButton() || isSubmitting}>Create Unconcentrated Liquidity Position</LiquidityButton>
        </StyledBox>
      </Box>
    </>
  )
}

const StyledBox = styled(Box)`
  border-radius: 10px;
  padding: 24px 32px;
  background: rgba(21, 22, 24, 0.75);
  margin-top: 28px;
`
const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 30px;
	margin-top: 30px;
	height: 1px;
`
const WarningStack = styled(Stack)`
  background: rgba(233, 209, 0, 0.04);
  border: 1px solid #e9d100;
  border-radius: 10px;
  color: #9d9d9d;
  padding: 8px;
  margin-top: 10px;
  margin-bottom: 30px;
`
const IconWrapper = styled(Box)`
  width: 53px; 
  text-align: center; 
  margin-top: 11px;
`
const SubTitle = styled(Box)`
	display: flex;
	font-size: 14px;
	font-weight: 500;
`

const SubTitleComment = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
	margin-top: 10px;
`

const WarningBox = styled(Box)`
	max-width: 500px;
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
`

const LiquidityButton = styled(Button)`
	width: 100%;
  background-color: #4e609f;
	color: #fff;
  font-size: 13px;
	border-radius: 10px;
	margin-bottom: 15px;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: #444;
    color: #adadad;
  } 
`

export default withSuspense(UnconcentPanel, <LoadingProgress />)
