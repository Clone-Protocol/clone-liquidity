import React, { useState, useEffect, useCallback, useMemo } from 'react'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { useIncept } from '~/hooks/useIncept'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'
import { Balance } from '~/features/Borrow/Balance.query'
import { Box, Stack, FormHelperText, Typography } from '@mui/material'
import { CometInfo, PositionInfo } from '~/features/MyLiquidity/CometPosition.query'
import { useForm, Controller, ControllerRenderProps, FieldValues } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { styled } from '@mui/system'
import RatioSlider from '~/components/Asset/RatioSlider'
import PairInput from '~/components/Asset/PairInput'
import PairInputView from '~/components/Asset/PairInputView'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import ConcentrationRangeBox from '~/components/Liquidity/comet/ConcentrationRangeBox'
import { useCometMutation } from '~/features/Comet/Comet.mutation'
import { TokenData } from "incept-protocol-sdk/sdk/src/interfaces"
import { calculateNewSinglePoolCometFromUsdiBorrowed } from 'incept-protocol-sdk/sdk/src/healthscore'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import HealthscoreBar from '~/components/Overview/HealthscoreBar'
import WarningMsg from '~/components/Common/WarningMsg'
import { RISK_SCORE_VAL } from '~/data/riskfactors'
import { StyledDivider } from '~/components/Common/StyledDivider'
import { SubmitButton } from '~/components/Common/CommonButtons'

const COLLATERAL_INDEX = 0 // USDi

const SinglepoolCometPanel = ({ balances, assetData, assetIndex, onRefetchData }: { balances: Balance, assetData: PositionInfo, assetIndex: number, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const { getInceptApp } = useIncept()
  const wallet = useAnchorWallet()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [mintRatio, setMintRatio] = useState(50)
  const [cometData, setCometData] = useState<CometInfo>({
    isTight: false,
    lowerLimit: assetData.price / 2,
    upperLimit: (assetData.price * 3) / 2
  })
  const [cometHealthScore, setHealthScore] = useState(0)
  const [maxMintable, setMaxMintable] = useState(0.0)
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  const [collAmount, setCollAmount] = useState(NaN) // NaN is used here so the input placeholder is displayed first
  const [mintAmount, setMintAmount] = useState(0.0)
  const [mintableAmount, setMintableAmount] = useState(0.0)
  const [aggregateLiquidity, setAggregateLiquidity] = useState(0.0)
  const {
    trigger,
    control,
    formState: { isDirty, errors, isSubmitting },
    handleSubmit,
    clearErrors
  } = useForm({ mode: 'onChange' })

  const calculateMintAmount = (mintable: number, ratio: number): number => mintable * ratio / 100;
  useMemo(
    () => setMintAmount(calculateMintAmount(mintableAmount, mintRatio)),
    [mintableAmount, mintRatio]
  )

  const initData = () => {
    setMintableAmount(0.0)
    setCollAmount(NaN)
    onRefetchData()
  }

  const { mutateAsync: mutateAsyncComet } = useCometMutation(publicKey)

  useEffect(() => {
    async function fetch() {
      if (wallet) {
        const program = getInceptApp(wallet)
        await program.loadManager()
        const tData = await program.getTokenData();
        setTokenData(tData);
      }
    }
    fetch()
  }, [wallet])

  useEffect(() => {
    async function fetch() {
      if (!tokenData || !wallet) return

      await trigger()

      if (isNaN(collAmount)) {
        setMintAmount(0)
        setHealthScore(0)
        return
      }

      console.log('calculateRange', collAmount + "/" + mintAmount)

      const {
        maxUsdiPosition,
        healthScore,
        lowerPrice,
        upperPrice
      } = calculateNewSinglePoolCometFromUsdiBorrowed(
        assetIndex,
        collAmount,
        mintAmount,
        tokenData
      )

      if (mintAmount > 0) {
        console.log('l', lowerPrice)
        console.log('u', upperPrice)

        setCometData({
          ...cometData,
          lowerLimit: Math.min(lowerPrice, assetData.centerPrice!),
          upperLimit: Math.max(upperPrice, assetData.centerPrice!)
        })
      }

      const chosenHealthScore = Math.max(0, healthScore)
      setHealthScore(isNaN(chosenHealthScore) ? 0 : chosenHealthScore)
      setMaxMintable(maxUsdiPosition)
      setMintableAmount(maxUsdiPosition)
      setAggregateLiquidity(mintAmount * 2)
    }
    fetch()
  }, [collAmount, mintAmount])

  const handleChangeMintRatio = useCallback(async (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setMintRatio(newValue)
      setMintableAmount(maxMintable)
    }
  }, [maxMintable, cometData])

  async function submit() {
    setLoading(true)
    await mutateAsyncComet(
      {
        collateralIndex: COLLATERAL_INDEX, //USDi
        iassetIndex: assetIndex,
        usdiAmount: mintAmount,
        collateralAmount: collAmount,
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Successfully established comet position')
            setLoading(false)
            initData()
            router.push('/liquidity')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to establish comet position')
          setLoading(false)
        }
      }
    )
  }
  const onFormSubmit = async () => {
    await submit()
  }

  const onCollAmountInputChange = (val: number, field: ControllerRenderProps<FieldValues, "collAmount">) => {
    field.onChange(val)
    setCollAmount(val)
  }

  const onMintAmountInputChange = (val: number, field: ControllerRenderProps<FieldValues, "mintAmount">) => {
    maxMintable > 0 ? setMintRatio(val * 100 / maxMintable) : 0
    field.onChange(val)
    setMintAmount(val)
  }

  const validateCollAmount = () => {
    if (collAmount > balances?.usdiVal) {
      return 'The collateral amount cannot exceed the balance.'
    }

    clearErrors('collAmountAmount')
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

  const disableSubmitButton = (): boolean => {
    const formHasErrors = (): boolean => {
      if ((errors.collAmount && errors.collAmount.message !== "") || (errors.mintAmount && errors.mintAmount.message !== "")) {
        return true
      }
      return false
    }

    if (!isDirty || formHasErrors()) {
      return true
    }

    return false
  }

  const hasRiskScore = cometHealthScore < RISK_SCORE_VAL

  return (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}
      <Box>
        <Box>
          <Box><Typography variant='p_lg'>Collateral Amount</Typography></Box>
          <Controller
            name="collAmount"
            control={control}
            rules={{
              validate() {
                return validateCollAmount()
              }
            }}
            render={({ field }) => (
              <PairInput
                tickerIcon={'/images/assets/USDi.png'}
                tickerSymbol="USDi"
                value={isNaN(collAmount) ? "" : collAmount}
                dollarPrice={0}
                headerTitle="Balance"
                headerValue={balances?.usdiVal}
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => onCollAmountInputChange(parseFloat(evt.currentTarget.value), field)}
                onMax={(value: number) => onCollAmountInputChange(value, field)}
              />
            )}
          />
          <FormHelperText error={!!errors.collAmount?.message}>{errors.collAmount?.message}</FormHelperText>
        </Box>
        <StyledDivider />
        <Box mb='13px'>
          <Box>
            <Typography variant='p_lg'>Liquidity Amount</Typography>
          </Box>
          <Box marginTop='15px' marginBottom='10px'>
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
                    value={isNaN(mintAmount) ? "" : mintAmount}
                    dollarPrice={0}
                    headerTitle="Max amount mintable"
                    headerValue={maxMintable}
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => onMintAmountInputChange(parseFloat(evt.currentTarget.value), field)}
                    onMax={(value: number) => onMintAmountInputChange(value, field)}
                  />
                )}
              />
            </Box>
            <Box width='275px'>
              <PairInputView
                tickerIcon={assetData.tickerIcon}
                tickerSymbol={assetData.tickerSymbol}
                value={mintAmount / assetData.price}
                dollarPrice={mintAmount}
              />
            </Box>
          </Stack>
          <FormHelperText error={!!errors.mintAmount?.message}>{errors.mintAmount?.message}</FormHelperText>
        </Box>
        <BoxWithBorder padding="15px 24px">
          <Stack direction='row' justifyContent='space-between'>
            <Box><Typography variant="p">Aggregate Liquidity Value</Typography></Box>
            <Box><Typography variant="p_xlg">${aggregateLiquidity.toLocaleString()}</Typography></Box>
          </Stack>
        </BoxWithBorder>
        <StyledDivider />

        <BoxWithBorder padding="20px 24px">
          <Box><Typography variant="p">Projected Liquidity Concentration Range</Typography> <InfoTooltip title={TooltipTexts.concentrationRange} /></Box>

          <Box marginTop='45px' marginBottom='5px'>
            <ConcentrationRange
              assetData={assetData}
              cometData={cometData}
              max={assetData.maxRange}
              defaultLower={(assetData.price / 2)}
              defaultUpper={((assetData.price * 3) / 2)}
            />
          </Box>

          <ConcentrationRangeBox assetData={assetData} cometData={cometData} />

          <Box my="15px">
            <Box mb="15px"><Typography variant="p">Projected Healthscore</Typography> <InfoTooltip title={TooltipTexts.healthScoreCol} /></Box>
            <HealthscoreBar score={cometHealthScore} width={490} />
            {hasRiskScore &&
              <WarningMsg>This position will have high possibility to become subject to liquidation.</WarningMsg>
            }
          </Box>
        </BoxWithBorder>

        <SubmitButton onClick={handleSubmit(onFormSubmit)} disabled={disableSubmitButton() || isSubmitting} sx={hasRiskScore ? { backgroundColor: '#ff8e4f' } : {}}>
          <Typography variant='p_lg'>{hasRiskScore && 'Accept Risk and '} Open Singlepool Comet Position</Typography>
        </SubmitButton>
      </Box >
    </>
  )
}

const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`

export default withSuspense(SinglepoolCometPanel, <LoadingProgress />)