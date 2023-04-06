import React, { useState, useEffect } from 'react'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import { Box, Stack, Button, FormHelperText, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { styled } from '@mui/system'
import RatioSlider from '~/components/Asset/RatioSlider'
import PairInput from '~/components/Asset/PairInput'
import PairInputView from '~/components/Asset/PairInputView'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import HealthscoreBar from '~/components/Overview/HealthscoreBar'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useLiquidityDetailQuery } from '~/features/MyLiquidity/multipool/LiquidityPosition.query'
import { useNewPositionMutation } from '~/features/MyLiquidity/multipool/LiquidityPosition.mutation'
import { useRouter } from 'next/router'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import MultipoolBlank from '~/components/Overview/MultipoolBlank'
import DataPlusIcon from 'public/images/database-plus.svg'
import AirballoonIcon from 'public/images/airballoon-outline.svg'
import ChooseCollateralDialog from './Dialogs/ChooseCollateralDialog'
import { StyledDivider } from '~/components/Common/StyledDivider'
import { SubmitButton } from '~/components/Common/CommonButtons'

const RISK_SCORE_VAL = 20

const MultipoolCometPanel = ({ assetIndex, onRefetchData }: { assetIndex: number, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const [mintRatio, setMintRatio] = useState(0)
  const [maxMintable, setMaxMintable] = useState(0.0)
  const [totalLiquidity, setTotalLiquidity] = useState(0)
  const [healthScore, setHealthScore] = useState(0)
  const [assetHealthCoefficient, setAssetHealthCoefficient] = useState(0)
  const [validMintValue, setValidMintValue] = useState(false)
  const [openChooseCollateral, setOpenChooseCollateral] = useState(false)

  const { data: positionInfo, refetch } = useLiquidityDetailQuery({
    userPubKey: publicKey,
    index: assetIndex,
    refetchOnMount: true,
    enabled: publicKey != null
  })

  useEffect(() => {
    if (positionInfo !== undefined) {
      const healthCoefficient = toNumber(positionInfo.tokenData.pools[assetIndex].assetInfo.positionHealthScoreCoefficient);
      setAssetHealthCoefficient(healthCoefficient)
      setHealthScore(positionInfo.totalHealthScore)
      setMaxMintable(positionInfo.totalCollValue * positionInfo.totalHealthScore / healthCoefficient)
      initData()
    }
  }, [open, positionInfo])

  const initData = () => {
    setMintRatio(0)
    onRefetchData()
  }

  const {
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { isDirty, errors, isSubmitting },
    watch,
    clearErrors
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      mintAmount: 0,
    }
  })

  const [mintAmount] = watch([
    'mintAmount',
  ])

  const handleChangeMintRatio = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setMintRatio(newValue)
    }
  }

  const validateMintAmount = () => {
    if (!isDirty) {
      clearErrors('mintAmount')
      return
    }

    if (!mintAmount || mintAmount <= 0) {
      return 'Mint amount should be above zero'
    } else if (mintAmount >= maxMintable) {
      return 'Mint amount cannot exceed the max mintable amount'
    }
  }

  useEffect(() => {
    if (positionInfo !== undefined) {
      const mintAmount = maxMintable * mintRatio / 100
      setValue('mintAmount', mintAmount);
      setHealthScore(positionInfo.totalHealthScore - assetHealthCoefficient * mintAmount / positionInfo.totalCollValue)
      setTotalLiquidity(mintAmount * 2)
      setValidMintValue(mintRatio > 0 && mintRatio < 100 && mintAmount > 0 && mintAmount < maxMintable)
      trigger()
    }
  }, [mintRatio])

  const { mutateAsync } = useNewPositionMutation(publicKey)
  const onNewLiquidity = async () => {
    // setLoading(true)
    await mutateAsync({
      poolIndex: assetIndex,
      changeAmount: mintAmount,
    },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            // enqueueSnackbar('Successfully established new liquidity position')
            refetch()
            initData()
            router.push('/liquidity')
          }
          // setLoading(false)
        },
        onError(err) {
          console.error(err)
          // enqueueSnackbar('Error establishing new liquidity position')
          // setLoading(false)
        }
      })
  }

  const handleChooseCollateral = (collId: number) => {
    setOpenChooseCollateral(false)
  }

  const isValid = Object.keys(errors).length === 0
  const hasRiskScore = healthScore < RISK_SCORE_VAL

  const BlankNoCollateral = () => (
    <MultipoolBlank title='Deposit collaterals to multipool to get started' subtitle='Multipool Liquidity Positions are designed to enable advanced users to 
    fully leverage the CLS' icon={DataPlusIcon} />
  )

  const BlankAlreadyPool = () => (
    <MultipoolBlank title='Liquidity position for this pool already exists for Multipool' subtitle='Please edit the liquidity for this pool in My Liquidity or select a different pool' icon={AirballoonIcon} />
  )

  const MultipoolComet = () => {
    return positionInfo ? (
      <>
        {loading && (
          <LoadingWrapper>
            <LoadingIndicator open inline />
          </LoadingWrapper>
        )}
        <Box mb='10px'>
          <BoxWithBorder p='20px'>
            <Box>
              <Typography variant='p_lg'>Current Multipool Stat</Typography>
            </Box>
            <Box my='15px'>
              <Box mb='10px'><Typography variant='p' color='#989898'>Total Multipool Collateral Value</Typography></Box>
              <Box><Typography variant='p_xlg'>${positionInfo.totalCollValue.toLocaleString()} USD</Typography></Box>
            </Box>
            <Box>
              <Box mb='10px'><Typography variant='p' color='#989898'>Current Multipool Healthscore</Typography></Box>
              <HealthscoreBar score={positionInfo.totalHealthScore} width={480} hiddenThumbTitle={true} />
            </Box>
          </BoxWithBorder>

          <StyledDivider />
          <Box mb='13px'>
            <Box>
              <Typography variant='p_lg'>Liquidity Amount</Typography>
            </Box>
            <Box mt='15px' mb='10px' p='5px'>
              <RatioSlider min={0} max={100} value={mintRatio} hideValueBox onChange={handleChangeMintRatio} />
              <Box display='flex' justifyContent='space-between' marginTop='-10px'>
                <Box><Typography variant='p_sm'>Min</Typography></Box>
                <Box><Typography variant='p_sm'>Max</Typography></Box>
              </Box>
            </Box>
            <Stack direction='row' alignItems='flex-end' gap={1}>
              <Box width='275px'>
                <Controller
                  name="mintAmount"
                  control={control}
                  rules={{
                    validate() {
                      return validateMintAmount()
                    }
                  }}
                  render={({ field }) => (
                    <PairInput
                      tickerIcon={'/images/assets/USDi.png'}
                      tickerSymbol="USDi"
                      value={parseFloat(field.value.toFixed(3))}
                      dollarPrice={0}
                      headerTitle="Max Amount Mintable"
                      headerValue={maxMintable}
                      onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                        let mintVal = parseFloat(evt.currentTarget.value)
                        mintVal = isNaN(mintVal) ? 0 : mintVal
                        field.onChange(mintVal)
                        maxMintable > 0 ? setMintRatio(mintVal * 100 / maxMintable) : 0
                      }}
                      onMax={(value: number) => {
                        field.onChange(value)
                        maxMintable > 0 ? setMintRatio(value * 100 / maxMintable) : 0
                      }}
                      onTickerClicked={() => setOpenChooseCollateral(true)}
                    />
                  )}
                />
              </Box>
              <Box width='275px'>
                <PairInputView
                  tickerIcon={positionInfo.tickerIcon}
                  tickerSymbol={positionInfo.tickerSymbol}
                  value={mintAmount / positionInfo.price}
                  dollarPrice={mintAmount}
                />
              </Box>
            </Stack>
            <FormHelperText error={!!errors.mintAmount?.message}>{errors.mintAmount?.message}</FormHelperText>
          </Box>
          <BoxWithBorder padding="15px 24px">
            <Stack direction='row' justifyContent='space-between'>
              <Box><Typography variant="p">Aggregate Liquidity Value</Typography></Box>
              <Box><Typography variant="p_xlg">${totalLiquidity.toLocaleString()}</Typography></Box>
            </Stack>
          </BoxWithBorder>
          <StyledDivider />

          <BoxWithBorder padding="15px 24px">
            <Box>
              <Box mb="15px"><Typography variant="p">Projected Multipool Healthscore</Typography> <InfoTooltip title={TooltipTexts.healthScoreCol} /></Box>
              <HealthscoreBar score={healthScore} prevScore={positionInfo.totalHealthScore} width={470} hideIndicator={true} />
              {hasRiskScore &&
                <WarningStack direction='row'><WarningAmberIcon sx={{ color: '#ed2525', width: '15px' }} /> <Typography variant='p' ml='8px'>This position will have high possibility to become subject to liquidation.</Typography></WarningStack>
              }
            </Box>
          </BoxWithBorder>
        </Box>

        <SubmitButton onClick={handleSubmit(onNewLiquidity)} disabled={!(isValid && validMintValue) || isSubmitting} sx={hasRiskScore ? { backgroundColor: '#ff8e4f' } : {}}>
          <Typography variant='p_lg'>{hasRiskScore && 'Accept Risk and '} Open Multipool Liquidity Position</Typography>
        </SubmitButton>

        <ChooseCollateralDialog
          open={openChooseCollateral}
          handleChooseCollateral={handleChooseCollateral}
          handleClose={() => setOpenChooseCollateral(false)}
        />
      </>
    ) : <></>
  }

  if (positionInfo?.hasNoCollateral) {
    return <BlankNoCollateral />
  } else if (positionInfo?.hasAlreadyPool) {
    return <BlankAlreadyPool />
  } else {
    return <MultipoolComet />
  }
}

const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`
const WarningStack = styled(Stack)`
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
  border: 1px solid ${(props) => props.theme.palette.error.main};
  color: ${(props) => props.theme.palette.text.secondary};
`

export default withSuspense(MultipoolCometPanel, <LoadingProgress />)