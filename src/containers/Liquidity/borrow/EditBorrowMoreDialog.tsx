import React, { useState, useCallback, useEffect } from 'react'
import { Box, Divider, styled, Button, Dialog, DialogContent, FormHelperText, Stack } from '@mui/material'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEditBorrowMutation } from '~/features/Borrow/Borrow.mutation'
import {
	PairData
} from '~/features/MyLiquidity/BorrowPosition.query'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import EditBorrowedInput from '~/components/Liquidity/comet/EditBorrowedInput'
import WarningIcon from 'public/images/warning-icon.png'
import { SliderTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'

const EditBorrowMoreDialog = ({ borrowId, borrowDetail, open, onHideEditForm, onRefetchData }: any) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const borrowIndex = parseInt(borrowId)

  const [editType, setEditType] = useState(0) // 0 : borrow more , 1: repay

  const [maxCollVal, setMaxCollVal] = useState(0);

  // MEMO: expected collateral Ratio is 10% under from the min collateral ratio
  const isRisk = editType === 0 && borrowDetail.minCollateralRatio * 1.1 >= borrowDetail.collateralRatio
  const isLackBalance = editType === 1 && borrowDetail.borrowedIasset > borrowDetail.iassetVal

  const isWarning = isRisk || isLackBalance

  //collateralAmount / getAssetInfo(poolIndex).price * (borrowedIasset (minus value above if repay, plus value above if borrow more))
  const [expectedCollRatio, setExpectedCollRatio] = useState(0)

  //max borrowable
  useEffect(() => {
    setMaxCollVal(editType === 0 ? ((borrowDetail.collateralAmount * 100) / (borrowDetail.oPrice * borrowDetail.minCollateralRatio)) - borrowDetail.borrowedIasset : borrowDetail.iassetVal)
  }, [borrowDetail.usdiVal, borrowDetail.iassetVal])

  const handleChangeType = useCallback((event: React.SyntheticEvent, newValue: number) => {
		setEditType(newValue)
    setMaxCollVal(newValue === 0 ? ((borrowDetail.collateralAmount * 100) / (borrowDetail.oPrice * borrowDetail.minCollateralRatio)) - borrowDetail.borrowedIasset : borrowDetail.iassetVal)
	}, [editType])

  const fromPair: PairData = {
		tickerIcon: borrowDetail.tickerIcon,
		tickerName: borrowDetail.tickerName,
		tickerSymbol: borrowDetail.tickerSymbol,
	}

  const { mutateAsync } = useEditBorrowMutation(publicKey)

  const {
		handleSubmit,
		control,
		formState: { isDirty, errors },
		watch,
    setValue
	} = useForm({
    mode: 'onChange',
    defaultValues: {
      borrowAmount: 0.0,
    }
	})
  const [borrowAmount] = watch([
		'borrowAmount',
	])

  const initData = () => {
    setValue('borrowAmount', 0.0)
  }

  useEffect(() => {
    if (editType === 0) { // borrow more
      setExpectedCollRatio(borrowDetail.collateralAmount * 100 / (borrowDetail.oPrice * (borrowDetail.borrowedIasset + borrowAmount)))
    } else { // repay
      setExpectedCollRatio(borrowDetail.collateralAmount * 100 / (borrowDetail.oPrice * (borrowDetail.borrowedIasset - borrowAmount)))
    }
  }, [borrowAmount, editType])

	const onEdit = async () => {
    setLoading(true)
    await mutateAsync(
      {
        borrowIndex,
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

      <Dialog open={open} onClose={onHideEditForm} TransitionComponent={SliderTransition}>
        <DialogContent sx={{ backgroundColor: '#16171a' }}>
          <Box sx={{ padding: '8px 1px', color: '#fff' }}>
            <Box>
              <Controller
                name="borrowAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return ''
                    } else if (value > maxCollVal) {
                      return 'The borrow amount cannot exceed the balance.'
                    }
                  }
                }}
                render={({ field }) => (
                  <EditBorrowedInput
                    editType={editType}
                    tickerIcon={fromPair.tickerIcon}
                    tickerSymbol={fromPair.tickerSymbol}
                    collAmount={parseFloat(field.value.toFixed(4))}
                    collAmountDollarPrice={field.value}
                    maxCollVal={maxCollVal}
                    currentCollAmount={borrowDetail.borrowedIasset}
                    dollarPrice={borrowDetail.borrowedIasset * borrowDetail.oPrice}
                    onChangeType={handleChangeType}
                    onChangeAmount={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const borrowAmt = parseFloat(event.currentTarget.value)
                      field.onChange(borrowAmt)
                    }}
                    onMax={(value: number) => {
                      field.onChange(value)
                    }}
                  />
                )}
              />
              <FormHelperText error={!!errors.borrowAmount?.message}>{errors.borrowAmount?.message}</FormHelperText>
            </Box>

            <Box sx={{ padding: '5px 3px 5px 3px' }}>
              <Stack sx={{ marginTop: '15px' }} direction="row" justifyContent="space-between">
                <DetailHeader>Expected Collateral Ratio <InfoTooltip title="expected collateral ratio" /></DetailHeader>
                <DetailValue>{ editType === 0 || borrowAmount < borrowDetail.borrowedIasset ? `${expectedCollRatio.toLocaleString()}%` : 'Paid in full'} <span style={{color: '#949494'}}>(prev. {borrowDetail.borrowedIasset > 0 ? `${borrowDetail.collateralRatio.toLocaleString()}%` : '-'})</span></DetailValue>
              </Stack>
              <Stack sx={{ marginTop: '15px' }} direction="row" justifyContent="space-between">
                <DetailHeader>Min Collateral Ratio <InfoTooltip title="min colalteral ratio" /></DetailHeader>
                <DetailValue>{ editType === 0 || borrowAmount < borrowDetail.borrowedIasset ? `${borrowDetail.minCollateralRatio.toLocaleString()}%` : '-'}</DetailValue>
              </Stack>
            </Box>

            { isWarning && (editType === 1 && borrowAmount >= borrowDetail.borrowedIasset) && 
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
                  { isRisk && 'This borrow position has significant risk of liquidation.' }
                  { isLackBalance && `Not enough wallet balance to pay in full.` }
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
  &:hover {
    background-color: #7A86B6;
  }
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