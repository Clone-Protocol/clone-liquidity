import React, { useState, useEffect } from 'react'
import { Box, styled, Dialog, DialogContent, FormHelperText, Typography } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import Image from 'next/image'
import { useEditCollateralQuery } from '~/features/MyLiquidity/comet/EditCollateral.query'
import { useCollateralMutation } from '~/features/MyLiquidity/comet/Collateral.mutation'
import { useForm, Controller } from 'react-hook-form'
import { StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import { FadeTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { StyledDivider } from '~/components/Common/StyledDivider'
import PairInput from '~/components/Liquidity/comet/PairInput'
import DepositMoreOnIcon from 'public/images/add-liquidity-icon-on.svg'
import DepositMoreOffIcon from 'public/images/add-liquidity-icon-off.svg'
import WithdrawOnIcon from 'public/images/withdraw-liquidity-icon-on.svg'
import WithdrawOffIcon from 'public/images/withdraw-liquidity-icon-off.svg'
import HealthscoreBar from '~/components/Overview/HealthscoreBar'
import WarningMsg from '~/components/Common/WarningMsg'
import { SubmitButton } from '~/components/Common/CommonButtons'
import HealthscoreView from '~/components/Liquidity/comet/HealthscoreView'

const RISK_SCORE_VAL = 10
const EditCollateralDialog = ({ open, isNewDeposit, onRefetchData, handleChooseColl, handleClose }: { open: boolean, isNewDeposit: boolean, onRefetchData: () => void, handleChooseColl?: () => void, handleClose: () => void }) => {
  const { publicKey } = useWallet()
  const [tab, setTab] = useState(0) // 0 : deposit , 1: withdraw
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }
  const collIndex = 0 // NOTE: currently only support onUSD
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
  }, [open])

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

        if (tab === 0) {
          setTotalCollValue(collData.totalCollValue + (collAmount * collData.collAmountDollarPrice))
        } else {
          setTotalCollValue(collData.totalCollValue - (collAmount * collData.collAmountDollarPrice))
        }

        trigger()
      }
    }
    fetch()
  }, [open, collData, collAmount, tab])

  const { mutateAsync } = useCollateralMutation(publicKey)
  const onEdit = async () => {
    try {
      const data = await mutateAsync(
        {
          collIndex,
          collAmount,
          editType: tab
        }
      )
      if (data) {
        console.log('data', data)
        refetch()
        initData()
        onRefetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  let isValid = (() => {
    let valid = Object.keys(errors).length === 0
    if (collData?.hasCometPositions) {
      valid = valid && healthScore > 0.5
    }
    return valid
  })()

  const hasRiskScore = healthScore < RISK_SCORE_VAL

  return collData ? (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={400}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b' }}>
          <BoxWrapper>
            <Box mb='5px'>
              <Typography variant='p_xlg'>Manage Collateral</Typography>
            </Box>

            <StyledTabs value={tab} onChange={handleChangeTab}>
              <StyledTab value={0} label="Deposit more" icon={tab === 0 ? <Image src={DepositMoreOnIcon} alt='deposit' /> : <Image src={DepositMoreOffIcon} alt='deposit' />}></StyledTab>
              <StyledTab value={1} label="Withdraw" icon={tab === 1 ? <Image src={WithdrawOnIcon} alt='withdraw' /> : <Image src={WithdrawOffIcon} alt='withdraw' />}></StyledTab>
            </StyledTabs>

            <StyledDivider />

            <Box mb='15px'>
              <Controller
                name="collAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return ''
                    } else if (tab === 0 && value > collData.balance) {
                      return 'The collateral amount cannot exceed the balance.'
                    } else if (tab === 1 && collData.hasCometPositions && value >= maxWithdrawable) {
                      return 'Cannot withdraw the maximum amount.'
                    } else if (tab === 1 && !collData.hasCometPositions && value > maxWithdrawable) {
                      return 'Cannot withdraw more than maximum amount.'
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
                    dollarPrice={collData.totalCollValue}
                    maxDisabled={tab === 1 && collData.hasCometPositions}
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

            <Box>
              <Box><Typography variant='p' color='#989898'>Projected Collateral Value <InfoTooltip title={TooltipTexts.projectedCometCollValue} /></Typography></Box>
              <Box><Typography variant='p_xlg'>${totalCollValue.toLocaleString()}</Typography> <Typography variant='p' color='#989898'>(current: ${collData.totalCollValue.toLocaleString()})</Typography></Box>
            </Box>

            { // MEMO : This is because when a user adds a new collateral type on devnet, they won’t see an exising healthscore. but will be add later on mainnet 
              !isNewDeposit &&
              <BoxWithBorder padding='10px 20px 0px 20px' mt='3px'>
                <Typography variant='p'>Projected Comet Health Score <InfoTooltip title={TooltipTexts.projectedHealthScore} /></Typography>
                <Box mt='10px'>
                  {/* <HealthscoreBar score={healthScore} prevScore={Number.isNaN(collData.prevHealthScore) ? 0 : collData.prevHealthScore} hideIndicator={true} width={400} /> */}
                  <HealthscoreView score={healthScore ? healthScore : collData.prevHealthScore} />
                </Box>
              </BoxWithBorder>
            }

            {hasRiskScore &&
              <WarningMsg>This change will put all your remaining comet collateral at risk of liquidation.</WarningMsg>
            }

            <SubmitButton onClick={handleSubmit(onEdit)} disabled={!isDirty || !isValid || isSubmitting}>
              {tab === 0 ? 'Deposit Collateral' : 'Withdraw Collateral'}
            </SubmitButton>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  ) : <></>
}

const BoxWrapper = styled(Box)`
  width: 400px;
  color: #fff;
  overflow-x: hidden;
`
const BoxWithBorder = styled(Box)`
	border: solid 1px ${(props) => props.theme.boxes.blackShade};
`

export default EditCollateralDialog