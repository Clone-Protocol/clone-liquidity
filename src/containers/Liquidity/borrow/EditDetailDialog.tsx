import React, { useState, useCallback, useEffect } from 'react'
import { Box, styled, Dialog, DialogContent, FormHelperText, Typography, Stack } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEditCollateralMutation } from '~/features/Borrow/Borrow.mutation'
import { PairData } from '~/features/MyLiquidity/BorrowPosition.query'
import { useForm, Controller } from 'react-hook-form'
import EditCollateralInput from '~/components/Liquidity/borrow/EditCollateralInput'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import { FadeTransition } from '~/components/Common/Dialog'
import CollRatioBar from '~/components/Liquidity/borrow/CollRatioBar'
import { RISK_RATIO_VAL } from '~/data/riskfactors'
import { SubmitButton } from '~/components/Common/CommonButtons'
import { Collateral as StableCollateral, collateralMapping } from '~/data/assets'
import Image from 'next/image'
import IconHealthScoreGraph from 'public/images/healthscore-graph.svg'

const EditDetailDialog = ({ borrowId, borrowDetail, open, onHideEditForm, onRefetchData }: { borrowId: number, borrowDetail: BorrowDetail, open: boolean, onHideEditForm: () => void, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
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
    initData()
    setMaxCollVal(newValue === 0 ? borrowDetail.usdiVal : borrowDetail.maxWithdrawableColl)
  }, [editType, open])

  const onUSDInfo = collateralMapping(StableCollateral.onUSD)
  const fromPair: PairData = {
    tickerIcon: onUSDInfo.collateralIcon,
    tickerName: onUSDInfo.collateralName,
    tickerSymbol: onUSDInfo.collateralSymbol,
  }

  const { mutateAsync } = useEditCollateralMutation(publicKey)

  const {
    handleSubmit,
    control,
    trigger,
    formState: { isDirty, errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      collAmount: NaN,
    }
  })
  const [collAmount] = watch([
    'collAmount',
  ])

  const initData = () => {
    setValue('collAmount', NaN)
    reset()
  }

  useEffect(() => {
    let expectedCollRatio
    if (collAmount) {
      if (editType === 0) { // deposit
        expectedCollRatio = (Number(borrowDetail.collateralAmount) + Math.abs(Number(collAmount))) * 100 / (borrowDetail.price * Number(borrowDetail.borrowedOnasset))
      } else { // withdraw
        expectedCollRatio = (Number(borrowDetail.collateralAmount) - Math.abs(Number(collAmount))) * 100 / (borrowDetail.price * Number(borrowDetail.borrowedOnasset))
      }
    } else {
      expectedCollRatio = borrowDetail.collateralRatio
    }
    setExpectedCollRatio(expectedCollRatio)
    setHasInvalidRatio(expectedCollRatio < borrowDetail.minCollateralRatio || Math.abs(collAmount) > maxCollVal)
    setHasRiskRatio(expectedCollRatio - borrowDetail.minCollateralRatio <= RISK_RATIO_VAL)
    trigger()
  }, [collAmount, editType])

  const onEdit = async () => {
    try {
      const data = await mutateAsync(
        {
          borrowIndex,
          collateralAmount: Math.abs(collAmount),
          editType
        }
      )

      if (data) {
        console.log('data', data)
        initData()
        setEditType(0)
        onRefetchData()
        onHideEditForm()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const isValid = Object.keys(errors).length === 0

  return (
    <>
      <Dialog open={open} onClose={onHideEditForm} TransitionComponent={FadeTransition} maxWidth={500}>
        <DialogContent sx={{ background: '#000916' }}>
          <BoxWrapper>
            <Typography variant='h3'>Manage Borrow Position: Collateral</Typography>

            <Stack direction='row' gap={3} mt='38px'>
              <ValueBox width='220px'>
                <Box mb='6px'><Typography variant='p'>Borrowed Asset</Typography></Box>
                <Box display="flex" alignItems='center'>
                  <Image src={fromPair.tickerIcon} width={28} height={28} alt={fromPair.tickerSymbol!} />
                  <Typography variant="h4" ml='10px'>
                    {fromPair.tickerName}
                  </Typography>
                </Box>
              </ValueBox>
              <ValueBox width='300px'>
                <Box mb='6px'><Typography variant='p'>Collateral Ratio</Typography></Box>
                <Stack direction='row' gap={1} alignItems='center'>
                  <Typography variant='h4'>{borrowDetail.collateralRatio.toFixed(2)}%</Typography>
                  <Typography variant='p_lg' color='#66707e'>(min {borrowDetail.minCollateralRatio.toFixed(2)}%)</Typography>
                </Stack>
              </ValueBox>
            </Stack>
            <Box my='38px'>
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
                    currentCollAmount={Number(borrowDetail.collateralAmount)}
                    dollarPrice={Number(borrowDetail.collateralAmount)}
                    hasInvalidRatio={hasInvalidRatio}
                    onChangeType={handleChangeType}
                    onChangeAmount={(event: React.FormEvent<HTMLInputElement>) => {
                      field.onChange(event.currentTarget.value)
                    }}
                    onMax={(value: number) => {
                      field.onChange(value)
                    }}
                  />
                )}
              />
              {/* <FormHelperText error={!!errors.collAmount?.message}>{errors.collAmount?.message}</FormHelperText> */}
            </Box>

            <RatioBox>
              {hasInvalidRatio ?
                <Box>
                  <Image src={IconHealthScoreGraph} alt='healthscore' />
                  <Box mt='7px'>
                    <Typography variant='p' color='#414e66'>Projected Collateral Ratio Unavailable</Typography>
                  </Box>
                </Box>
                :
                <Box>
                  <Typography variant='p'>Projected Collateral Ratio</Typography>
                  <Stack direction='row' gap={1}>
                    <Typography variant='h3' fontWeight={500} color={editType === 0 ? '#fff' : '#ff0084'}>
                      {expectedCollRatio.toFixed(2)}%
                    </Typography>
                    <Typography variant='p_xlg' color={editType === 0 ? '#4fe5ff' : '#ff0084'}>
                      {editType === 0 ? '+' : '-'}{(Math.abs(expectedCollRatio - borrowDetail.collateralRatio)).toFixed(2)}%
                    </Typography>
                  </Stack>
                  <Typography variant='p_lg' color={editType === 0 ? '#66707e' : '#ff0084'}>(min {borrowDetail.minCollateralRatio}%)</Typography>
                  {/* <CollRatioBar hasRiskRatio={hasRiskRatio} minRatio={borrowDetail.minCollateralRatio} ratio={expectedCollRatio} prevRatio={borrowDetail.collateralRatio} /> */}
                </Box>}
            </RatioBox>

            <SubmitButton onClick={handleSubmit(onEdit)} disabled={!isDirty || !isValid || isSubmitting} sx={hasRiskRatio ? { backgroundColor: '#ff8e4f' } : {}}>
              <Typography variant='p_lg'>{hasRiskRatio && 'Accept Risk and '}Edit Collateral</Typography>
            </SubmitButton>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}

const BoxWrapper = styled(Box)`
  width: 600px;
  color: #fff;
  overflow-x: hidden;
`
const ValueBox = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 78px;
  padding: 8px 30px;
  border-radius: 10px;
  line-height: 24px;
  background-color: ${(props) => props.theme.basis.jurassicGrey};
`
const RatioBox = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  border-radius: 5px;
  background-color: ${(props) => props.theme.basis.darkNavy};
  height: 120px;
`

export default EditDetailDialog