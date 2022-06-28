import React, { useState, useCallback, useEffect } from 'react'
import { Box, Divider, styled, Button, Dialog, DialogContent, FormHelperText, Stack } from '@mui/material'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEditMutation } from '~/features/Borrow/Borrow.mutation'
import {
	PairData
} from '~/features/MyLiquidity/BorrowPosition.query'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import EditBorrowedInput from '~/components/Liquidity/comet/EditBorrowedInput'
import WarningIcon from 'public/images/warning-icon.png'

const EditBorrowMoreDialog = ({ borrowId, borrowDetail, open, onHideEditForm, onRefetchData }: any) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const borrowIndex = parseInt(borrowId)

  const [editType, setEditType] = useState(0) // 0 : borrow more , 1: repay

  const [maxCollVal, setMaxCollVal] = useState(0);

  // MEMO: expected collateral Ratio is 10% under from the min collateral ratio
  const isRisk = borrowDetail.minCollateralRatio * 1.1 >= borrowDetail.collateralRatio

  useEffect(() => {
    setMaxCollVal(borrowDetail.usdiVal)
  }, [borrowDetail.usdiVal])

  const handleChangeType = useCallback((event: React.SyntheticEvent, newValue: number) => {
		setEditType(newValue)
    setMaxCollVal(newValue === 0 ? borrowDetail.usdiVal : borrowDetail.maxWithdrawableColl)
	}, [editType])

  const fromPair: PairData = {
		tickerIcon: '/images/assets/USDi.png',
		tickerName: 'USDi Coin',
		tickerSymbol: 'USDi',
	}

  const { mutateAsync } = useEditMutation(publicKey)

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

  const initData = () => {
    setValue('collAmount', 0.0)
    setValue('borrowAmount', 0.0)
  }

  const calculateBorrowAmount = (inputCollAmount: number, inputCollRatio: number) => {
    const assetOraclePrice = borrowDetail? borrowDetail.oPrice : 1
    const borrowAmount = (inputCollAmount * 100) / (assetOraclePrice * inputCollRatio)
    setValue('borrowAmount', borrowAmount)
  }

	const onEdit = async () => {
    setLoading(true)
    await mutateAsync(
      {
        borrowIndex,
        collateralAmount: collAmount,
        borrowAmount: borrowAmount,
        editType
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to edit')
            initData()
            onRefetchData()
            onHideEditForm()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to edit')
          setLoading(false)
        }
      }
    )
	}

  const isValid = Object.keys(errors).length === 0

  return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={onHideEditForm}>
        <DialogContent sx={{ backgroundColor: '#16171a' }}>
          <Box sx={{ padding: '8px 1px', color: '#fff' }}>
            <Box>
              <Controller
                name="collAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return 'the collateral amount should be above zero.'
                    } else if (value > maxCollVal) {
                      return 'The collateral amount cannot exceed the balance.'
                    }
                  }
                }}
                render={({ field }) => (
                  <EditBorrowedInput
                    editType={editType}
                    tickerIcon={fromPair.tickerIcon}
                    tickerSymbol={fromPair.tickerSymbol}
                    collAmount={field.value}
                    maxCollVal={maxCollVal}
                    currentCollAmount={borrowDetail.collateralAmount}
                    onChangeType={handleChangeType}
                    onChangeAmount={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const collAmt = parseFloat(event.currentTarget.value)
                      field.onChange(collAmt)
                      calculateBorrowAmount(collAmt, borrowDetail.collateralRatio)
                    }}
                    onMax={(value: number) => {
                      field.onChange(value)
                    }}
                  />
                )}
              />
              <FormHelperText error={!!errors.collAmount?.message}>{errors.collAmount?.message}</FormHelperText>
            </Box>

            <Box sx={{ padding: '5px 3px 5px 3px' }}>
              <Stack sx={{ marginTop: '15px' }} direction="row" justifyContent="space-between">
                <DetailHeader>Expected Collateral Ratio</DetailHeader>
                <DetailValue>{ editType === 0 || collAmount < borrowDetail.collateralAmount ? `${borrowDetail.collateralRatio.toLocaleString()}%` : 'Paid in full'} <span style={{color: '#949494'}}>(prev. {borrowDetail.collateralRatio.toLocaleString()}%)</span></DetailValue>
              </Stack>
              <Stack sx={{ marginTop: '15px' }} direction="row" justifyContent="space-between">
                <DetailHeader>Min Collateral Ratio</DetailHeader>
                <DetailValue>{ editType === 0 || collAmount < borrowDetail.collateralAmount ? `${borrowDetail.minCollateralRatio.toLocaleString()}%` : ''}</DetailValue>
              </Stack>
            </Box>

            { isRisk && 
              <Stack
                sx={{
                  background: 'rgba(233, 209, 0, 0.04)',
                  border: '1px solid #e9d100',
                  borderRadius: '10px',
                  color: '#9d9d9d',
                  padding: '8px',
                  marginTop: '10px',
                  marginBottom: '30px',
                }}
                direction="row">
                <Box sx={{ width: '53px', marginLeft: '20px', textAlign: 'center' }}>
                  <Image src={WarningIcon} />
                </Box>
                <WarningBox>
                  This borrow position has significant risk of liquidation.
                </WarningBox>
              </Stack>
            }

            <StyledDivider />

            <ActionButton onClick={handleSubmit(onEdit)} disabled={!isDirty || !isValid}>{ editType === 0 ? 'Borrow more' : 'Repay' }</ActionButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )  
}

const DetailHeader = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #949494;
`

const DetailValue = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #fff;
`

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 25px;
	margin-top: 15px;
	height: 1px;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #4e609f;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 2px;
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

const WarningBox = styled(Box)`
	max-width: 500px;
  padding-left: 36px;
  padding-top: 4px;
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
`

export default EditBorrowMoreDialog