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

const EditCollateralDialog = ({ open, isDeposit, handleChooseColl, handleClose, onRefetchData }: any) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  // const borrowIndex = parseInt(borrowId)

  const [editType, setEditType] = useState(isDeposit ? 0 : 1) // 0 : deposit , 1: withdraw
  const [healthScore, setHealthScore] = useState(0)

  useEffect(() => {
    setEditType(isDeposit ? 0 : 1)
  }, [isDeposit])

  // useEffect(() => {
  //   setMaxCollVal(borrowDetail.usdiVal)
  // }, [borrowDetail.usdiVal])

  const handleChangeType = useCallback((event: React.SyntheticEvent, newValue: number) => {
		setEditType(newValue)
	}, [editType])


  // TODO: need to set binding props
  const assetIndex = 1

  const { data: collData } = useEditCollateralQuery({
    userPubKey: publicKey,
    index: assetIndex,
	  refetchOnMount: true,
    enabled: open && publicKey != null
	})

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
    }
	})
  const [collAmount] = watch([
		'collAmount',
	])

  const initData = () => {
    setValue('collAmount', 0.0)
  }

  const { mutateAsync } = useCollateralMutation(publicKey)
	const onEdit = async () => {
    setLoading(true)
    // mutateAsync
	}

  const isValid = Object.keys(errors).length === 0

  return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition}>
        <DialogContent sx={{ backgroundColor: '#16171a' }}>
          <Box sx={{ padding: '4px 10px', color: '#fff' }}>
            <Box>
              <Controller
                name="collAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return ''
                    } 
                    // else if (value > maxCollVal) {
                    //   return 'The collateral amount cannot exceed the balance.'
                    // }
                  }
                }}
                render={({ field }) => (
                  <EditCollateralInput
                    editType={editType}
                    tickerIcon={collData?.tickerIcon}
                    tickerSymbol={collData?.tickerSymbol}
                    collAmount={field.value}
                    collAmountDollarPrice={field.value}
                    balance={collData?.balance}
                    currentCollAmount={collData?.collAmount}
                    dollarPrice={collData?.collAmountDollarPrice}
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

            <Box sx={{ padding: '10px 3px 5px 3px' }}>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Projected Multipool Health Score <InfoTooltip title="Projected Multipool Health Score" /></DetailHeader>
                <DetailValue>{healthScore.toFixed(2)}/100 <span style={{color: '#949494'}}>(prev. {collData?.prevHealthScore.toFixed()}/100)</span></DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Total Collateral Value <InfoTooltip title="Total Collateral Value" /></DetailHeader>
                <DetailValue>${collData?.totalCollValue.toLocaleString()}</DetailValue>
              </Stack>
            </Box>

            <StyledDivider />

            <ActionButton onClick={handleSubmit(onEdit)} disabled={!isDirty || !isValid}>{ editType === 0 ? 'Deposit' : 'Withdraw' }</ActionButton>
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