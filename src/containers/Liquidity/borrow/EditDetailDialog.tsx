import React, { useState, useCallback, useEffect } from 'react'
import { Box, styled, Button, Dialog, DialogContent, FormHelperText, Stack, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEditCollateralMutation } from '~/features/Borrow/Borrow.mutation'
import { PairData } from '~/features/MyLiquidity/BorrowPosition.query'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import EditCollateralInput from '~/components/Liquidity/comet/EditCollateralInput'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import { FadeTransition } from '~/components/Common/Dialog'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import CollRatioBar from '~/components/Liquidity/borrow/CollRatioBar'
import { RISK_RATIO_VAL } from '~/data/riskfactors'
import { StyledDivider } from '~/components/Common/StyledDivider'
import { SubmitButton } from '~/components/Common/CommonButtons'

const EditDetailDialog = ({ borrowId, borrowDetail, open, onHideEditForm, onRefetchData }: { borrowId: number, borrowDetail: BorrowDetail, open: boolean, onHideEditForm: () => void, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const borrowIndex = borrowId

  const [editType, setEditType] = useState(0) // 0 : deposit , 1: withdraw
  const [maxCollVal, setMaxCollVal] = useState(0);
  const [expectedCollRatio, setExpectedCollRatio] = useState(0)
  const [hasInvalidRatio, setHasInvalidRatio] = useState(false)
  const [hasRiskRatio, setHasRiskRatio] = useState(false)

  useEffect(() => {
    setMaxCollVal(borrowDetail.usdiVal)
  }, [borrowDetail.usdiVal])

  const handleChangeType = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setEditType(newValue)
    setMaxCollVal(newValue === 0 ? borrowDetail.usdiVal : borrowDetail.maxWithdrawableColl)
  }, [editType, open])

  const fromPair: PairData = {
    tickerIcon: '/images/assets/USDi.png',
    tickerName: 'USDi Coin',
    tickerSymbol: 'USDi',
  }

  const { mutateAsync } = useEditCollateralMutation(publicKey)

  const {
    handleSubmit,
    control,
    trigger,
    formState: { isDirty, errors },
    watch,
    setValue
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      collAmount: 0.0,
    }
  })
  const [collAmount] = watch([
    'collAmount',
  ])

  const initData = () => {
    setEditType(0)
    setValue('collAmount', 0.0)
  }

  useEffect(() => {
    let expectedCollRatio
    if (collAmount) {
      if (editType === 0) { // deposit
        expectedCollRatio = (borrowDetail.collateralAmount + collAmount) * 100 / (borrowDetail.price * borrowDetail.borrowedIasset)
      } else { // withdraw
        expectedCollRatio = ((borrowDetail.collateralAmount - collAmount) * 100 / (borrowDetail.price * borrowDetail.borrowedIasset))
      }
    } else {
      expectedCollRatio = borrowDetail.collateralRatio
    }
    setExpectedCollRatio(expectedCollRatio)
    setHasInvalidRatio(expectedCollRatio < borrowDetail.minCollateralRatio)
    setHasRiskRatio(expectedCollRatio - borrowDetail.minCollateralRatio <= RISK_RATIO_VAL)
    trigger()
  }, [collAmount, editType])

  const onEdit = async () => {
    setLoading(true)
    await mutateAsync(
      {
        borrowIndex,
        collateralAmount: collAmount,
        editType
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Successfully edited borrow details')
            initData()
            onRefetchData()
            onHideEditForm()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Error editing borrow details')
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

      <Dialog open={open} onClose={onHideEditForm} TransitionComponent={FadeTransition} maxWidth={500}>
        <DialogContent sx={{ background: '#1b1b1b' }}>
          <BoxWrapper>
            <Typography variant='p_xlg'>Edit Collateral of Borrow Position</Typography>
            <StyledDivider />
            <Box>
              <Controller
                name="collAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return ''
                    } else if (value > maxCollVal) {
                      if (editType === 0) {
                        return 'The deposit amount exceeds wallet balance.'
                      } else {
                        return 'Withdraw amount cannot exceed value for Max Withdraw-able.'
                      }
                    }
                  }
                }}
                render={({ field }) => (
                  <EditCollateralInput
                    editType={editType}
                    tickerIcon={fromPair.tickerIcon}
                    tickerSymbol={fromPair.tickerSymbol}
                    collAmount={field.value}
                    collAmountDollarPrice={field.value}
                    maxCollVal={maxCollVal}
                    currentCollAmount={borrowDetail.collateralAmount}
                    dollarPrice={borrowDetail.collateralAmount}
                    onChangeType={handleChangeType}
                    onChangeAmount={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const collAmt = parseFloat(event.currentTarget.value)
                      field.onChange(collAmt)
                    }}
                    onMax={(value: number) => {
                      field.onChange(value)
                    }}
                  />
                )}
              />
              <FormHelperText error={!!errors.collAmount?.message}>{errors.collAmount?.message}</FormHelperText>
            </Box>

            <BoxWithBorder>
              {hasInvalidRatio ? <Box width='100%' display='flex' justifyContent='center' alignItems='center'><Typography variant='p'>N/A</Typography></Box> :
                <Box>
                  <Typography variant='h8'>Projected Collateral Ratio</Typography>
                  <CollRatioBar hasRiskRatio={hasRiskRatio} minRatio={borrowDetail.minCollateralRatio} ratio={expectedCollRatio} prevRatio={borrowDetail.collateralRatio} />
                </Box>}
            </BoxWithBorder>

            <SubmitButton onClick={handleSubmit(onEdit)} disabled={!isDirty || !isValid} sx={hasRiskRatio ? { backgroundColor: '#ff8e4f' } : {}}>
              <Typography variant='p_lg'>{hasRiskRatio && 'Accept Risk and '}Edit Collateral</Typography>
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

export default EditDetailDialog