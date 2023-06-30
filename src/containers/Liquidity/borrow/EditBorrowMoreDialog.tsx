import React, { useState, useCallback, useEffect } from 'react'
import { Box, styled, Dialog, DialogContent, FormHelperText, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEditBorrowMutation } from '~/features/Borrow/Borrow.mutation'
import { useCloseMutation } from '~/features/Borrow/Borrow.mutation'
import { PairData } from '~/features/MyLiquidity/BorrowPosition.query'
import { useForm, Controller } from 'react-hook-form'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import EditBorrowedInput from '~/components/Liquidity/borrow/EditBorrowedInput'
import { FadeTransition } from '~/components/Common/Dialog'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import CollRatioBar from '~/components/Liquidity/borrow/CollRatioBar'
import { StyledDivider } from '~/components/Common/StyledDivider'
import { SubmitButton } from '~/components/Common/CommonButtons'

const EditBorrowMoreDialog = ({ borrowId, borrowDetail, open, onHideEditForm, onRefetchData }: { borrowId: number, borrowDetail: BorrowDetail, open: boolean, onHideEditForm: () => void, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const borrowIndex = borrowId
  const [editType, setEditType] = useState(0) // 0 : borrow more , 1: repay
  const [maxCollVal, setMaxCollVal] = useState(0);
  const router = useRouter()

  // MEMO: expected collateral Ratio is 10% under from the min collateral ratio
  const [hasLackBalance, setHasLackBalance] = useState(editType === 1 && Number(borrowDetail.borrowedIasset) > Number(borrowDetail.iassetVal))
  const [isFullRepaid, setIsFullRepaid] = useState(false)
  const [hasRiskRatio, setHasRiskRatio] = useState(editType === 0 && borrowDetail.minCollateralRatio * 1.1 >= borrowDetail.collateralRatio)
  const [expectedCollRatio, setExpectedCollRatio] = useState(0)

  //max borrowable
  useEffect(() => {
    setMaxCollVal(editType === 0 ? ((Number(borrowDetail.collateralAmount) * 100) / (borrowDetail.price * borrowDetail.minCollateralRatio)) - Number(borrowDetail.borrowedIasset) : borrowDetail.iassetVal)
  }, [borrowDetail.usdiVal, borrowDetail.iassetVal, editType])

  const handleChangeType = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setEditType(newValue)
    initData()
  }, [editType])

  const fromPair: PairData = {
    tickerIcon: borrowDetail.tickerIcon,
    tickerName: borrowDetail.tickerName,
    tickerSymbol: borrowDetail.tickerSymbol,
  }

  const { mutateAsync } = useEditBorrowMutation(publicKey)
  const { mutateAsync: mutateAsyncClose } = useCloseMutation(publicKey)

  const {
    handleSubmit,
    control,
    formState: { isDirty, errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      borrowAmount: NaN,
    }
  })
  const [borrowAmount] = watch([
    'borrowAmount',
  ])

  const initData = () => {
    setValue('borrowAmount', NaN)
    reset()
  }

  useEffect(() => {
    let expectedCollRatio
    if (borrowAmount) {
      if (editType === 0) { // borrow more
        expectedCollRatio = (Number(borrowDetail.collateralAmount) * 100 / (borrowDetail.price * (Number(borrowDetail.borrowedIasset) + borrowAmount)))
      } else { // repay
        expectedCollRatio = (Number(borrowDetail.collateralAmount) * 100 / (borrowDetail.price * (Number(borrowDetail.borrowedIasset) - borrowAmount)))
      }
    } else {
      expectedCollRatio = (borrowDetail.collateralRatio)
    }
    setExpectedCollRatio(expectedCollRatio)

    if (editType === 1) {
      setHasLackBalance(borrowAmount > borrowDetail.iassetVal)
      setIsFullRepaid(Number(borrowDetail.borrowedIasset) === borrowAmount)
    }
    setHasRiskRatio(borrowDetail.minCollateralRatio * 1.1 >= expectedCollRatio)
  }, [borrowAmount, editType])

  const onEdit = async () => {
    try {
      const data = await mutateAsync(
        {
          borrowIndex,
          borrowAmount: borrowAmount,
          editType
        }
      )

      if (data) {
        console.log('data', data)
        initData()
        onRefetchData()
        onHideEditForm()
      }
    } catch (err) {
      console.error(err)
    }

  }

  const onClose = async () => {
    try {
      const data = await mutateAsyncClose(
        {
          borrowIndex,
        }
      )
      if (data) {
        console.log('data', data)
        onRefetchData()
        onHideEditForm()
        router.push('/liquidity?ltab=1')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const isValid = Object.keys(errors).length === 0

  return (
    <>
      <Dialog open={open} onClose={onHideEditForm} TransitionComponent={FadeTransition} maxWidth={500}>
        <DialogContent sx={{ background: '#1b1b1b' }}>
          <BoxWrapper>
            <Typography variant='p_xlg'>Edit Borrowed Amount of Borrow Position</Typography>
            <StyledDivider />
            <Box>
              <Controller
                name="borrowAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return ''
                    } else if (value > maxCollVal) {
                      if (editType === 0) {
                        return 'The borrow amount cannot exceed the max borrowable amount.'
                      } else {
                        return 'Repay amount cannot exceed the Wallet Balance'
                      }
                    } else if (editType === 1 && value > Number(borrowDetail.borrowedIasset)) {
                      return 'Repay amount cannot exceed the Current Debt'
                    }
                  }
                }}
                render={({ field }) => (
                  <EditBorrowedInput
                    editType={editType}
                    tickerIcon={fromPair.tickerIcon}
                    tickerSymbol={fromPair.tickerSymbol}
                    collAmount={field.value}
                    collAmountDollarPrice={field.value * borrowDetail.price}
                    maxCollVal={maxCollVal}
                    currentCollAmount={Number(borrowDetail.borrowedIasset)}
                    dollarPrice={Number(borrowDetail.borrowedIasset) * borrowDetail.price}
                    onChangeType={handleChangeType}
                    onChangeAmount={(event: React.ChangeEvent<HTMLInputElement>) => {
                      // const borrowAmt = parseFloat(event.currentTarget.value)
                      field.onChange(event.currentTarget.value)
                    }}
                    onMax={(value: number) => {
                      field.onChange(value)
                    }}
                  />
                )}
              />
              <FormHelperText sx={{ textAlign: 'right' }} error={!!errors.borrowAmount?.message}>{errors.borrowAmount?.message}</FormHelperText>
            </Box>

            <BoxWithBorder>
              {hasLackBalance || isFullRepaid ? <Box width='100%' display='flex' justifyContent='center' alignItems='center'><Typography variant='p'>{hasLackBalance ? 'N/A' : 'Position will be paid in full'}</Typography></Box> :
                < Box >
                  <Typography variant='h8'>Projected Collateral Ratio</Typography>
                  <CollRatioBar hasRiskRatio={hasRiskRatio} minRatio={borrowDetail.minCollateralRatio} ratio={expectedCollRatio} prevRatio={borrowDetail.collateralRatio} />
                </Box>}
            </BoxWithBorder>

            <SubmitButton onClick={handleSubmit(!isFullRepaid ? onEdit : onClose)} disabled={!isDirty || !isValid || isSubmitting} sx={hasRiskRatio ? { backgroundColor: '#ff8e4f' } : {}}>
              {!isFullRepaid ? <Typography variant='p_lg'>{hasRiskRatio && 'Accept Risk and '}Edit Borrowed Amount</Typography>
                : <Typography variant='p_lg'>Withdraw all Collateral & Close Position</Typography>}
            </SubmitButton>

            <Box display='flex' justifyContent='center'>
              <DataLoadingIndicator onRefresh={() => onRefetchData()} />
            </Box>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}

const BoxWrapper = styled(Box)`
  width: 500px;
  color: #fff;
  overflow-x: hidden;
`
const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  padding: 15px 18px;
  margin-top: 16px;
`

export default EditBorrowMoreDialog