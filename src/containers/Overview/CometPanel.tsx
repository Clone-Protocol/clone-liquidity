// @DEPRECATED
import { Box, Stack, Button, Divider, FormHelperText } from '@mui/material'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { styled } from '@mui/system'
import { useIncept } from '~/hooks/useIncept'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import InfoBookIcon from 'public/images/info-book-icon.svg'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import PairInput from '~/components/Asset/PairInput'
import PairInputView from '~/components/Asset/PairInputView'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import ConcentrationRangeBox from '~/components/Liquidity/comet/ConcentrationRangeBox'
import RatioSlider from '~/components/Asset/RatioSlider'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { LoadingProgress } from '~/components/Common/Loading'
import { CometInfo, PositionInfo } from '~/features/MyLiquidity/CometPosition.query'
import { useCometMutation } from '~/features/Comet/Comet.mutation'
import withSuspense from '~/hocs/withSuspense'
import Image from 'next/image'
import { useForm, Controller, ControllerRenderProps, FieldValues } from 'react-hook-form'
import { Balance } from '~/features/Borrow/Balance.query'
import { useRouter } from 'next/router'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { TokenData } from "incept-protocol-sdk/sdk/src/interfaces"
import { calculateNewSinglePoolCometFromUsdiBorrowed } from "incept-protocol-sdk/sdk/src/healthscore"
import { TooltipTexts } from '~/data/tooltipTexts'

const CometPanel = ({ balances, assetData, assetIndex, onRefetchData }: { balances: Balance, assetData: PositionInfo, assetIndex: number, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const wallet = useAnchorWallet()
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
  const COLLATERAL_INDEX = 0 // USDi

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

      const program = getInceptApp(wallet)

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
      return 'The mint amount should be above zero'
    } if (mintAmount >= maxMintable) {
      return 'The mint amount cannot exceed the maximum mintable amout'
    }

    clearErrors('mintAmount')
  }

  const formHasErrors = (): boolean => {
    if ((errors.collAmount && errors.collAmount.message !== "") || (errors.mintAmount && errors.mintAmount.message !== "")) {
      return true
    }

    return false
  }

  const disableSubmitButton = (): boolean => {
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
        <PriceIndicatorBox
          tickerIcon={assetData.tickerIcon}
          tickerName={assetData.tickerName}
          tickerSymbol={assetData.tickerSymbol}
          value={assetData.price}
        />

        <StyledBox>
          <WarningStack direction="row">
            <IconWrapper>
              <Image src={InfoBookIcon} />
            </IconWrapper>
            <WarningBox>
              Fill in two of the three parts and the third part will automatically generate.{' '}
              <br />Learn more <span style={{ textDecoration: 'underline' }}>here</span>.
            </WarningBox>
          </WarningStack>

          <Box>
            <SubTitle>
              <Image src={OneIcon} />{' '}
              <Box marginLeft='9px'>Provide stable coins to collateralize</Box>
            </SubTitle>
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
            <SubTitle>
              <Image src={TwoIcon} />{' '}
              <Box marginLeft='9px'>
                Amount of USDi & {assetData.tickerSymbol} to mint into {assetData.tickerSymbol}{' '}
                AMM
              </Box>
            </SubTitle>
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
            <SubTitle>
              <Box marginLeft='9px'>Projected Liquidity Concentration Range <InfoTooltip title={TooltipTexts.concentrationRange} /></Box>
            </SubTitle>

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
            <HealthScoreTitle>Projected Healthscore <InfoTooltip title={TooltipTexts.healthScoreCol} /></HealthScoreTitle>
            <HealthScoreValue><span style={{ fontSize: '32px', fontWeight: 'bold' }}>{cometHealthScore.toFixed(2)}</span>/100</HealthScoreValue>
          </Box>

          <StyledDivider />

          <CometButton onClick={handleSubmit(onFormSubmit)} disabled={disableSubmitButton() || isSubmitting}>Create Comet Position</CometButton>
        </StyledBox>
      </Box>
    </>
  )
}

const StyledBox = styled(Box)`
  border-radius: 10px;
  padding: 24px 32px;
  background: rgba(21, 22, 24, 0.75);
  margin-top: 28px;
`
const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 30px;
	margin-top: 30px;
	height: 1px;
`
const WarningStack = styled(Stack)`
  background: rgba(128, 156, 255, 0.09);
  border: 1px solid #809cff;
  border-radius: 10px;
  color: #809cff;
  padding: 8px;
  margin-bottom: 26px;
`
const IconWrapper = styled(Box)`
  width: 73px; 
  text-align: center; 
  margin-top: 6px;
`
const WarningBox = styled(Box)`
	max-width: 500px;
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
`
const SubTitle = styled(Box)`
	display: flex;
	font-size: 14px;
	font-weight: 500;
`
const HealthScoreTitle = styled(Box)`
  font-size: 14px; 
  font-weight: 500; 
  margin-left: 9px;
`
const HealthScoreValue = styled(Box)`
  font-size: 20px; 
  font-weight: 500;
  text-align: center;
`
const CometButton = styled(Button)`
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

export default withSuspense(CometPanel, <LoadingProgress />)
