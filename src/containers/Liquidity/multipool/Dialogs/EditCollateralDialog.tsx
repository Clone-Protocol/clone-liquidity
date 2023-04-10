import React, { useState, useEffect } from 'react'
import { Box, styled, Button, Dialog, DialogContent, FormHelperText, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import Image from 'next/image'
import { useEditCollateralQuery } from '~/features/MyLiquidity/multipool/EditCollateral.query'
import { useCollateralMutation } from '~/features/MyLiquidity/multipool/Collateral.mutation'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { FadeTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { StyledDivider } from '~/components/Common/StyledDivider'
import PairInput from '~/components/Liquidity/unconcent/PairInput'
import DepositMoreOnIcon from 'public/images/add-liquidity-icon-on.svg'
import DepositMoreOffIcon from 'public/images/add-liquidity-icon-off.svg'
import WithdrawOnIcon from 'public/images/withdraw-liquidity-icon-on.svg'
import WithdrawOffIcon from 'public/images/withdraw-liquidity-icon-off.svg'
import HealthscoreBar from '~/components/Overview/HealthscoreBar'
import { SubmitButton } from '~/components/Common/CommonButtons'

const EditCollateralDialog = ({ open, isNewDeposit, onRefetchData, handleChooseColl, handleClose }: { open: boolean, isNewDeposit: boolean, onRefetchData: () => void, handleChooseColl: () => void, handleClose: () => void }) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const [tab, setTab] = useState(0) // 0 : deposit , 1: withdraw
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }
  const collIndex = 0 // NOTE: currently only support USDi
  const [healthScore, setHealthScore] = useState(0)
  const [totalCollValue, setTotalCollValue] = useState(0)
  const [maxWithdrawable, setMaxWithdrawable] = useState(0)

  const { data: collData, refetch } = useEditCollateralQuery({
    userPubKey: publicKey,
    index: collIndex,
    refetchOnMount: "always",
    enabled: open && publicKey != null
  })

  const {
    handleSubmit,
    control,
    formState: { isDirty, errors, isSubmitting },
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
        if (collData.prevHealthScore) {
          let loss = (100 - collData.prevHealthScore) * collData.collAmount;
          let collDelta = (tab === 0 ? 1 : -1) * collAmount;

          setHealthScore(100 - loss / (collData.collAmount + collDelta))
          setMaxWithdrawable(collData.collAmount - loss / 100)
        } else {
          if (tab === 0) {
            setHealthScore(100)
          } else {
            setHealthScore(0)
          }
        }

        setTotalCollValue(collAmount * collData.collAmountDollarPrice)
        trigger()
      }
    }
    fetch()
  }, [open, collData, collAmount, tab])

  const { mutateAsync } = useCollateralMutation(publicKey)
  const onEdit = async () => {
    // setLoading(true)
    await mutateAsync(
      {
        collIndex,
        collAmount,
        editType: tab
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            // enqueueSnackbar('Successfully modified collateral')
            refetch()
            initData()
            onRefetchData()
          }
          // setLoading(false)
        },
        onError(err) {
          console.error(err)
          // enqueueSnackbar('Error modifying collateral')
          // setLoading(false)
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

      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={500}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b' }}>
          <BoxWrapper>
            <Box mb='5px'>
              <Typography variant='p_xlg'>
                {isNewDeposit ? 'Deposit New Collateral' : 'Manage Collateral'}
              </Typography>
            </Box>
            {!isNewDeposit &&
              <StyledTabs value={tab} onChange={handleChangeTab}>
                <StyledTab value={0} label="Deposit more" icon={tab === 0 ? <Image src={DepositMoreOnIcon} /> : <Image src={DepositMoreOffIcon} />}></StyledTab>
                <StyledTab value={1} label="Withdraw" icon={tab === 1 ? <Image src={WithdrawOnIcon} /> : <Image src={WithdrawOffIcon} />}></StyledTab>
              </StyledTabs>
            }
            <StyledDivider />

            {/* <Box>
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
            </Box> */}

            <Box mb='15px'>
              <Controller
                name="collAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return ''
                    } else if ((tab === 0 && value > collData.balance) || (tab === 1 && value > maxWithdrawable)) {
                      return 'The collateral amount cannot exceed the balance.'
                    }
                  }
                }}
                render={({ field }) => (
                  <PairInput
                    tickerIcon={collData.tickerIcon}
                    tickerSymbol={collData.tickerSymbol}
                    rightHeaderTitle={tab === 0 ? 'Wallet Balance' : 'Max Withdrawable'}
                    value={field.value}
                    valueDollarPrice={field.value}
                    inputTitle='Collateral'
                    balance={tab === 0 ? collData.balance : maxWithdrawable}
                    currentAmount={collData.collAmount}
                    dollarPrice={collData.collAmountDollarPrice}
                    hideBottomBox={isNewDeposit}
                    onChange={(event: React.FormEvent<HTMLInputElement>) => {
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

            { // MEMO : This is because when a user adds a new collateral type on devnet, they won’t see an exising healthscore. but will be add later on mainnet 
              !isNewDeposit &&
              <Box>
                <Typography variant='h8'>Projected Multipool Stat</Typography>
                <BoxWithBorder padding='10px 20px'>
                  <Box>
                    <Box><Typography variant='p' color='#989898'>Projected Multipool Collateral Value <InfoTooltip title={TooltipTexts.projectedLiquidityConcRange} /></Typography></Box>
                    <Box><Typography variant='p_xlg'>${totalCollValue.toLocaleString()}</Typography> <Typography variant='p' color='#989898'>(current: ${collData.totalCollValue.toLocaleString()})</Typography></Box>
                  </Box>
                  <Box mt='10px'>
                    <Box><Typography variant='p' color='#989898'>Projected Multipool Healthscore <InfoTooltip title={TooltipTexts.projectedHealthScore} /></Typography></Box>
                    <Box p='10px'><HealthscoreBar score={healthScore} prevScore={Number.isNaN(collData.prevHealthScore) ? 0 : collData.prevHealthScore} hideIndicator={true} width={400} /></Box>
                  </Box>
                </BoxWithBorder>
              </Box>
            }

            <SubmitButton onClick={handleSubmit(onEdit)} disabled={!isDirty || !isValid || isSubmitting}>
              {isNewDeposit ? 'Deposit' :
                tab === 0 ? 'Deposit more' : 'Withdraw'}
            </SubmitButton>

            <Box display='flex' justifyContent='center'>
              <DataLoadingIndicator />
            </Box>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  ) : <></>
}

const BoxWrapper = styled(Box)`
  width: 500px;
  color: #fff;
  overflow-x: hidden;
`
const BoxWithBorder = styled(Box)`
	border: solid 1px ${(props) => props.theme.boxes.blackShade};
`

export default EditCollateralDialog