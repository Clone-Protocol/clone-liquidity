import React, { useState, useCallback, useEffect } from 'react'
import { Box, Divider, styled, Button, Dialog, DialogContent, FormHelperText, Stack } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEditCollateralQuery } from '~/features/MyLiquidity/multipool/EditCollateral.query'
import { useCollateralMutation } from '~/features/MyLiquidity/multipool/Collateral.mutation'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import EditCollateralInput from '~/components/Liquidity/multipool/EditCollateralInput'
import { SliderTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'

const EditCollateralDialog = ({ open, isDeposit, onRefetchData, handleChooseColl, handleClose }: { open: boolean, isDeposit: boolean, onRefetchData: () => void, handleChooseColl: () => void, handleClose: () => void }) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const collIndex = 0 // NOTE: currently only support USDi
  const [editType, setEditType] = useState(isDeposit ? 0 : 1) // 0 : deposit , 1: withdraw
  const [healthScore, setHealthScore] = useState(0)
  const [totalCollValue, setTotalCollValue] = useState(0)
  const [maxWithdrawable, setMaxWithdrawable] = useState(0)

  useEffect(() => {
    setEditType(isDeposit ? 0 : 1)
  }, [isDeposit])

  const handleChangeType = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setEditType(newValue)
  }, [editType])

  const { data: collData, refetch } = useEditCollateralQuery({
    userPubKey: publicKey,
    index: collIndex,
    refetchOnMount: "always",
    enabled: open && publicKey != null
  })

  const {
    handleSubmit,
    control,
    formState: { isDirty, errors },
    watch,
    setValue,
    trigger,
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
    setValue('collAmount', 0.0)
  }

  // initialize state data
  useEffect(() => {
    async function fetch() {
      if (open && collData) {
        initData()
        setHealthScore(collData.prevHealthScore)
        setTotalCollValue(collData.totalCollValue)
      }
    }
    fetch()
  }, [open, collData])

  // calculate HealthScore & totalCollValue
  useEffect(() => {
    async function fetch() {
      if (open && collData) {
        let collDelta = (editType === 0 ? 1 : -1) * collAmount;

        if (collData.prevHealthScore) {
          let loss = (100 - collData.prevHealthScore) * collData.collAmount;

          setHealthScore(100 - loss / (collData.totalCollValue + collDelta))
          setMaxWithdrawable(collData.collAmount - loss / 100)
        } else {
          if (editType === 0) {
            setHealthScore(100)
          } else {
            setHealthScore(0)
          }
        }

        setTotalCollValue(collData.totalCollValue + collDelta)
        trigger()
      }
    }
    fetch()
  }, [open, collData, collAmount, editType])

  const { mutateAsync } = useCollateralMutation(publicKey)
  const onEdit = async () => {
    setLoading(true)
    await mutateAsync(
      {
        collIndex,
        collAmount,
        editType
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Successfully modified collateral')
            refetch()
            initData()
            onRefetchData()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Error modifying collateral')
          setLoading(false)
        }
      }
    )
  }

  const isValid = Object.keys(errors).length === 0

  return collData ? (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}

      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition}>
        <DialogContent sx={{ backgroundColor: '#16171a' }}>
          <BoxWrapper>
            <Box>
              <Controller
                name="collAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return ''
                    }
                    else if ((editType === 0 && value > collData.balance) || (editType === 1 && value >= maxWithdrawable)) {
                      return 'The collateral amount cannot exceed the balance.'
                    }
                  }
                }}
                render={({ field }) => (
                  <EditCollateralInput
                    editType={editType}
                    tickerIcon={collData.tickerIcon}
                    tickerSymbol={collData.tickerSymbol}
                    collAmount={field.value}
                    collAmountDollarValue={field.value}
                    maxCollVal={editType === 0 ? collData.balance : maxWithdrawable}
                    currentCollAmount={collData.collAmount}
                    dollarPrice={collData.collAmountDollarPrice}
                    onChangeType={handleChangeType}
                    onChangeAmount={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const collAmt = parseFloat(event.currentTarget.value)
                      field.onChange(collAmt)
                    }}
                    onMax={(value: number) => {
                      field.onChange(value)
                    }}
                    onHandleChoose={handleChooseColl}
                  />
                )}
              />
              <FormHelperText error={!!errors.collAmount?.message}>{errors.collAmount?.message}</FormHelperText>
            </Box>

            <Box padding='10px 3px 5px 3px'>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Projected Multipool Health Score <InfoTooltip title={TooltipTexts.projectedMultipoolHealthScore} /></DetailHeader>
                <DetailValue>{healthScore.toFixed(2)}/100 <span style={{ color: '#949494' }}>(prev. {Number.isNaN(collData.prevHealthScore) ? '--' : collData.prevHealthScore.toFixed()}/100)</span></DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Total Collateral Value <InfoTooltip title={TooltipTexts.totalCollateralValueLong} /></DetailHeader>
                <DetailValue>${totalCollValue.toLocaleString()}</DetailValue>
              </Stack>
            </Box>

            <StyledDivider />

            <ActionButton onClick={handleSubmit(onEdit)} disabled={!isDirty || !isValid}>{editType === 0 ? 'Deposit' : 'Withdraw'}</ActionButton>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  ) : <></>
}

const BoxWrapper = styled(Box)`
  padding: 4px 10px; 
  color: #fff;
`
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
	margin-bottom: 18px;
	margin-top: 10px;
	height: 1px;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #4e3969;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 2px;
  &:hover {
    background-color: #4e3969;
  }
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

export default EditCollateralDialog