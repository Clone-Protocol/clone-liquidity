import React, { useState, useEffect, useCallback, useMemo } from 'react'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'
import { Balance } from '~/features/Borrow/Balance.query'
import { Box, Stack, Button, Divider, FormHelperText } from '@mui/material'
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
import { TokenData } from "incept-protocol-sdk/sdk/src/incept"
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'

const COLLATERAL_INDEX = 0 // USDi

const SinglepoolCometPanel = ({ balances, assetData, assetIndex, onRefetchData }: { balances: Balance, assetData: PositionInfo, assetIndex: number, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const { getInceptApp } = useIncept()
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
  const {
    trigger,
    control,
    formState: { isDirty, errors, isSubmitting },
    handleSubmit,
    clearErrors
  } = useForm({ mode: 'onChange' })

  const initData = () => {
    setMintableAmount(0.0)
    setCollAmount(NaN)
    onRefetchData()
  }

  const { mutateAsync: mutateAsyncComet } = useCometMutation(publicKey)

  useEffect(() => {
    async function fetch() {
      const program = getInceptApp()
      await program.loadManager()
      const tData = await program.getTokenData();
      setTokenData(tData);
    }
    fetch()
  }, [])

  useEffect(() => {
    async function fetch() {
      if (!tokenData) return

      await trigger()

      const program = getInceptApp()

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
      } = program.calculateNewSinglePoolCometFromUsdiBorrowed(
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
          lowerLimit: Math.min(lowerPrice, assetData.centerPrice),
          upperLimit: Math.max(upperPrice, assetData.centerPrice)
        })
      }

      const chosenHealthScore = Math.max(0, healthScore)
      setHealthScore(isNaN(chosenHealthScore) ? 0 : chosenHealthScore)
      setMaxMintable(maxUsdiPosition)
      setMintableAmount(maxUsdiPosition)
    }
    fetch()
  }, [collAmount, mintAmount])

  const validateCollAmount = () => {
    if (collAmount > balances?.usdiVal) {
      return 'The collateral amount cannot exceed the balance.'
    }

    clearErrors('collAmountAmount')
  }

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

  const validateMintAmount = () => {
    if (!isDirty) {
      clearErrors('mintAmount')
      return
    }

    if (!mintAmount || mintAmount <= 0) {
      return 'The mint amount should be above zero'
    } if (mintAmount >= maxMintable) {
      return 'The mint amount cannot exceed the maximum mintable amout'
    }

    clearErrors('mintAmount')
  }

  const handleChangeMintRatio = useCallback(async (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setMintRatio(newValue)
      setMintableAmount(maxMintable)
    }
  }, [maxMintable, cometData])

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

  return (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}
      <Box>
        <Box>
          <Box>Collateral Amount</Box>
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
        <Box>
          <Box>
            Liquidity Amount
          </Box>
          <Box marginTop='15px'>
            <RatioSlider min={0} max={100} value={mintRatio} hideValueBox onChange={handleChangeMintRatio} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '-8px' }}>
              <Box sx={{ fontSize: '11px', fontWeight: '500' }}>Min</Box>
              <Box sx={{ fontSize: '11px', fontWeight: '500' }}>Max</Box>
            </Box>
          </Box>
          <Box marginBottom='25px' marginTop='15px'>
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
                  headerTitle="Max amount mintable"
                  headerValue={maxMintable}
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) => onMintAmountInputChange(parseFloat(evt.currentTarget.value), field)}
                  onMax={(value: number) => onMintAmountInputChange(value, field)}
                />
              )}
            />
            <FormHelperText error={!!errors.mintAmount?.message}>{errors.mintAmount?.message}</FormHelperText>
          </Box>
          <PairInputView
            tickerIcon={assetData.tickerIcon}
            tickerSymbol={assetData.tickerSymbol}
            value={mintAmount / assetData.price}
          />
        </Box>
        <StyledDivider />
        <Box>
          <Box>
            Aggregate Liquidity Value
          </Box>
        </Box>
        <StyledDivider />

        <Box>
          <Box>Projected Liquidity Concentration Range <InfoTooltip title={TooltipTexts.concentrationRange} /></Box>

          <Box marginTop='110px' marginBottom='15px'>
            <ConcentrationRange
              assetData={assetData}
              cometData={cometData}
              max={assetData.maxRange}
              defaultLower={(assetData.price / 2)}
              defaultUpper={((assetData.price * 3) / 2)}
            />
          </Box>

          <ConcentrationRangeBox assetData={assetData} cometData={cometData} />
        </Box>
        <StyledDivider />

        <Box>
          <Box>Projected Healthscore <InfoTooltip title={TooltipTexts.healthScoreCol} /></Box>
          {/* <HealthScoreValue><span style={{ fontSize: '32px', fontWeight: 'bold' }}>{cometHealthScore.toFixed(2)}</span>/100</HealthScoreValue> */}
        </Box>

        <SubmitButton onClick={handleSubmit(onFormSubmit)} disabled={disableSubmitButton() || isSubmitting}>Open Singlepool Comet Position</SubmitButton>
      </Box>
    </>
  )
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 30px;
	margin-top: 30px;
	height: 1px;
`
const SubmitButton = styled(Button)`
	width: 100%;
	background-color: #4e609f;
	color: #fff;
	border-radius: 10px;
	margin-bottom: 15px;
  font-size: 13px;
  font-weight: 600;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

export default withSuspense(SinglepoolCometPanel, <LoadingProgress />)