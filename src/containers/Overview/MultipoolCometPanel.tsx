import React, { useState, useEffect } from 'react'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import { Balance } from '~/features/Borrow/Balance.query'
import { Box, Stack, Button, Divider, FormHelperText, Typography } from '@mui/material'
import { PositionInfo } from '~/features/MyLiquidity/CometPosition.query'
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
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'

const RISK_SCORE_VAL = 20

const MultipoolCometPanel = ({ assetIndex, onRefetchData }: { assetIndex: number, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const [mintRatio, setMintRatio] = useState(0)
  const [maxMintable, setMaxMintable] = useState(0.0)
  const [totalLiquidity, setTotalLiquidity] = useState(0)
  const [healthScore, setHealthScore] = useState(0)
  const [assetHealthCoefficient, setAssetHealthCoefficient] = useState(0)
  const [validMintValue, setValidMintValue] = useState(false)

  const { data: positionInfo, refetch } = useLiquidityDetailQuery({
    userPubKey: publicKey,
    index: assetIndex,
    refetchOnMount: true,
    enabled: publicKey != null
  })

  useEffect(() => {
    if (positionInfo !== undefined) {
      const healthCoefficient = toNumber(positionInfo.tokenData.pools[assetIndex].assetInfo.healthScoreCoefficient);
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
    formState: { isDirty, errors },
    watch,
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
    setLoading(true)
    await mutateAsync({
      poolIndex: assetIndex,
      changeAmount: mintAmount,
    },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Successfully established new liquidity position')
            refetch()
            initData()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Error establishing new liquidity position')
          setLoading(false)
        }
      })
  }

  const isValid = Object.keys(errors).length === 0
  const hasRiskScore = healthScore < RISK_SCORE_VAL

  return positionInfo ? (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}
      <Box>
        <BoxWithBorder p='20px'>
          <Box>
            <Typography variant='p_lg'>Current Multipool Stat</Typography>
          </Box>
          <Box my='15px'>
            <Box mb='15px'><Typography variant='p'>Total Multipool Collateral Value</Typography></Box>
            <Box><Typography variant='p_xlg'>${positionInfo.totalCollValue.toLocaleString()} USD</Typography></Box>
          </Box>
          <Box>
            <Box mb='15px'><Typography variant='p'>Current Multipool Healthscore</Typography></Box>
            <HealthscoreBar score={positionInfo.totalHealthScore} />
          </Box>
        </BoxWithBorder>

        <StyledDivider />
        <Box mb='13px'>
          <Box>
            <Typography variant='p_lg'>Liquidity Amount</Typography>
          </Box>
          <Box mt='15px' mb='10px'>
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
                  validate(value) {
                    if (!value || value < 0) {
                      return ''
                    }
                  }
                }}
                render={({ field }) => (
                  <PairInput
                    tickerIcon={'/images/assets/USDi.png'}
                    tickerSymbol="USDi"
                    value={parseFloat(field.value.toFixed(3))}
                    dollarPrice={0}
                    headerTitle="Max amount mintable"
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
                  />
                )}
              />
              <FormHelperText error={!!errors.mintAmount?.message}>{errors.mintAmount?.message}</FormHelperText>
            </Box>
            <Box width='275px'>
              <PairInputView
                tickerIcon={positionInfo.tickerIcon}
                tickerSymbol={positionInfo.tickerSymbol}
                value={mintAmount / positionInfo.price}
                dollarPrice={1445}
              />
            </Box>
          </Stack>
        </Box>
        <BoxWithBorder padding="15px 24px">
          <Stack direction='row' justifyContent='space-between'>
            <Box><Typography variant="p">Aggregate Liquidity Value</Typography></Box>
            <Box><Typography variant="p_xlg">${totalLiquidity.toLocaleString()}</Typography></Box>
          </Stack>
        </BoxWithBorder>
        <StyledDivider />

        <BoxWithBorder padding="20px 24px">
          <Box my="15px">
            <Box mb="15px"><Typography variant="p">Projected Healthscore</Typography> <InfoTooltip title={TooltipTexts.healthScoreCol} /></Box>
            <HealthscoreBar score={healthScore} />
            {hasRiskScore &&
              <WarningStack direction='row'><WarningAmberIcon sx={{ color: '#ed2525', width: '15px' }} /> <Typography variant='p' ml='8px'>This position will have high possibility to become subject to liquidation.</Typography></WarningStack>
            }
          </Box>
        </BoxWithBorder>

        <SubmitButton onClick={handleSubmit(onNewLiquidity)} disabled={!(isValid && validMintValue)} sx={hasRiskScore ? { backgroundColor: '#ff8e4f' } : {}}>
          <Typography variant='p_lg'>{hasRiskScore && 'Accept Risk and '} Open Multipool Liquidity Position</Typography>
        </SubmitButton>
      </Box >
    </>
  ) : <></>
}

const BoxWithBorder = styled(Box)`
        border: solid 1px ${(props) => props.theme.boxes.greyShade};
        `
const StyledDivider = styled(Divider)`
        background-color: ${(props) => props.theme.boxes.blackShade};
        margin-bottom: 21px;
        margin-top: 21px;
        height: 1px;
        `
const SubmitButton = styled(Button)`
        width: 100%;
        background-color: ${(props) => props.theme.palette.primary.main};
        color: #000;
        border-radius: 0px;
        margin-top: 25px;
        margin-bottom: 15px;
        &:hover {
          background - color: #7A86B6;
  }
        &:disabled {
          background - color: ${(props) => props.theme.boxes.grey};
        color: #000;
  }
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