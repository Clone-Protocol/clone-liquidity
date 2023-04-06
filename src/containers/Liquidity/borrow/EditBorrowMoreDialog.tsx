import React, { useState, useCallback, useEffect } from 'react'
import { Box, styled, Dialog, DialogContent, FormHelperText, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEditBorrowMutation } from '~/features/Borrow/Borrow.mutation'
import { useCloseMutation } from '~/features/Borrow/Borrow.mutation'
import {
  PairData
} from '~/features/MyLiquidity/BorrowPosition.query'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import EditBorrowedInput from '~/components/Liquidity/comet/EditBorrowedInput'
import { FadeTransition } from '~/components/Common/Dialog'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import CollRatioBar from '~/components/Liquidity/borrow/CollRatioBar'
import { StyledDivider } from '~/components/Common/StyledDivider'
import { SubmitButton } from '~/components/Common/CommonButtons'

const EditBorrowMoreDialog = ({ borrowId, borrowDetail, open, onHideEditForm, onRefetchData }: { borrowId: number, borrowDetail: BorrowDetail, open: boolean, onHideEditForm: () => void, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const borrowIndex = borrowId
  const [editType, setEditType] = useState(0) // 0 : borrow more , 1: repay
  const [maxCollVal, setMaxCollVal] = useState(0);
  const router = useRouter()

  // MEMO: expected collateral Ratio is 10% under from the min collateral ratio
  // const hasRiskRatio = editType === 0 && borrowDetail.minCollateralRatio * 1.1 >= borrowDetail.collateralRatio
  // const hasLackBalance = editType === 1 && borrowDetail.borrowedIasset > borrowDetail.iassetVal
  const [hasLackBalance, setHasLackBalance] = useState(editType === 1 && borrowDetail.borrowedIasset > borrowDetail.iassetVal)
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
      borrowAmount: 0.0,
    }
  })
  const [borrowAmount] = watch([
    'borrowAmount',
  ])

  const initData = () => {
    setValue('borrowAmount', 0.0)
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
    // borrowDetail.borrowedIasset > borrowDetail.iassetVal
    if (editType === 1) {
      setHasLackBalance(borrowAmount > borrowDetail.iassetVal)
      setIsFullRepaid(Number(borrowDetail.borrowedIasset) === borrowAmount)
    }
    setHasRiskRatio(borrowDetail.minCollateralRatio * 1.1 >= expectedCollRatio)
  }, [borrowAmount, editType])

  const onEdit = async () => {
    // setLoading(true)
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
            // enqueueSnackbar('Successfully modified borrow position')
            initData()
            onRefetchData()
            onHideEditForm()
          }
          // setLoading(false)
        },
        onError(err) {
          console.error(err)
          // enqueueSnackbar('Error modifying borrow position')
          // setLoading(false)
        }
      }
    )
  }

  const onClose = async () => {
    await mutateAsyncClose(
      {
        borrowIndex,
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            onRefetchData()
            onHideEditForm()
            router.push('/liquidity?ltab=3')
          }
        },
        onError(err) {
          console.error(err)
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
                    } else if (editType === 1 && value > borrowDetail.borrowedIasset) {
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
                      const borrowAmt = parseFloat(event.currentTarget.value)
                      field.onChange(borrowAmt)
                    }}
                    onMax={(value: number) => {
                      field.onChange(value)
                    }}
                  />
                )}
              />
              <FormHelperText sx={{ textAlign: 'right' }} error={!!errors.borrowAmount?.message}>{errors.borrowAmount?.message}</FormHelperText>
            </Box>

            {/* <BoxWithBorder>
              <Stack marginTop='15px' direction="row" justifyContent="space-between">
                <DetailHeader>Expected Collateral Ratio <InfoTooltip title={TooltipTexts.expectedCollateralRatio} /></DetailHeader>
                <DetailValue>{editType === 0 || borrowAmount < borrowDetail.borrowedIasset ? `${expectedCollRatio.toLocaleString()}%` : 'Paid in full'} <span style={{ color: '#949494' }}>(prev. {borrowDetail.borrowedIasset > 0 ? `${borrowDetail.collateralRatio.toLocaleString()}%` : '-'})</span></DetailValue>
              </Stack>
              <Stack marginTop='15px' direction="row" justifyContent="space-between">
                <DetailHeader>Min Collateral Ratio <InfoTooltip title={TooltipTexts.minCollateralRatio} /></DetailHeader>
                <DetailValue>{editType === 0 || borrowAmount < borrowDetail.borrowedIasset ? `${borrowDetail.minCollateralRatio.toLocaleString()}%` : '-'}</DetailValue>
              </Stack>
            </BoxWithBorder> */}

            <BoxWithBorder>
              {hasLackBalance || isFullRepaid ? <Box width='100%' display='flex' justifyContent='center' alignItems='center'><Typography variant='p'>{hasLackBalance ? 'N/A' : 'Position will be paid in full'}</Typography></Box> :
                < Box >
                  <Typography variant='h8'>Projected Collateral Ratio</Typography>
                  <CollRatioBar hasRiskRatio={hasRiskRatio} minRatio={borrowDetail.minCollateralRatio} ratio={expectedCollRatio} prevRatio={borrowDetail.collateralRatio} />
                </Box>}
            </BoxWithBorder>

            {/* {isWarning && (editType === 1 && borrowAmount >= borrowDetail.borrowedIasset) &&
              <WarningStack direction="row">
                <WarningIconBox>
                  <Image src={WarningIcon} />
                </WarningIconBox>
                <WarningBox>
                  {isRisk && 'This borrow position has significant risk of liquidation.'}
                  {isLackBalance && `Not enough wallet balance to pay in full.`}
                </WarningBox>
              </WarningStack>
            } */}

            <SubmitButton onClick={handleSubmit(!isFullRepaid ? onEdit : onClose)} disabled={!isDirty || !isValid || isSubmitting} sx={hasRiskRatio ? { backgroundColor: '#ff8e4f' } : {}}>
              {!isFullRepaid ? <Typography variant='p_lg'>{hasRiskRatio && 'Accept Risk and '}Edit Borrowed Amount</Typography>
                : <Typography variant='p_lg'>Withdraw all Collateral & Close Position</Typography>}
            </SubmitButton>

            <Box display='flex' justifyContent='center'>
              <DataLoadingIndicator />
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

// const WarningStack = styled(Stack)`
//   background: rgba(233, 209, 0, 0.04);
//   border: 1px solid #e9d100;
//   border-radius: 10px;
//   color: #9d9d9d;
//   padding: 8px;
//   margin-top: 10px;
//   margin-bottom: 30px;
// `
// const WarningIconBox = styled(Box)`
//   width: 53px; 
//   margin-left: 20px; 
//   text-align: center;
// `
// const WarningBox = styled(Box)`
// 	max-width: 500px;
//   padding-left: 36px;
//   padding-top: 4px;
// 	padding-right: 10px;
// 	font-size: 11px;
// 	font-weight: 500;
// 	color: #989898;
// `

export default EditBorrowMoreDialog