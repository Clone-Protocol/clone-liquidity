import React, { useState, useCallback, useEffect } from 'react'
import { Box, Stack, styled, Button, Dialog, DialogContent, FormHelperText, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useIncept } from '~/hooks/useIncept'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as PI, CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import EditConcentrationRangeBox from '~/components/Liquidity/comet/EditConcentrationRangeBox'
import { CometInfo } from '~/features/MyLiquidity/CometPosition.query'
import { useEditMutation } from '~/features/Comet/Comet.mutation'
import EditRatioSlider from '~/components/Liquidity/comet/EditRatioSlider'
import EditCollateralInput from '~/components/Liquidity/comet/EditCollateralInput'
import { useForm, Controller, ControllerRenderProps, FieldValues } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { FadeTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TokenData, Comet } from 'incept-protocol-sdk/sdk/src/interfaces'
import { calculateEditCometSinglePoolWithUsdiBorrowed } from 'incept-protocol-sdk/sdk/src/healthscore'
import { TooltipTexts } from '~/data/tooltipTexts'
import HealthscoreBar from '~/components/Overview/HealthscoreBar'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import WarningMsg from '~/components/Common/WarningMsg'
import { RISK_SCORE_VAL } from '~/data/riskfactors'
import { StyledDivider } from '~/components/Common/StyledDivider'
import { SubmitButton } from '~/components/Common/CommonButtons'

const EditDetailDialog = ({ cometId, balance, assetData, cometDetail, open, onHideEditForm, onRefetchData }: { cometId: number, balance: number, assetData: PI, cometDetail: CometDetail, open: boolean, onHideEditForm: () => void, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const { getInceptApp } = useIncept()
  const wallet = useAnchorWallet()
  const [loading, setLoading] = useState(false)
  const [collAmount, setCollAmount] = useState(NaN)
  const [mintAmount, setMintAmount] = useState(0.0)
  const { enqueueSnackbar } = useSnackbar()
  const cometIndex = cometId
  const calculateMintAmount = (mintable: number, ratio: number): number => mintable * ratio / 100;

  const [editType, setEditType] = useState(0) // 0 : deposit , 1: withdraw
  const [cometData, setCometData] = useState<CometInfo>({
    isTight: false,
    lowerLimit: cometDetail.lowerLimit,
    upperLimit: cometDetail.upperLimit
  })
  const [refresh, setRefresh] = useState(true);

  const {
    trigger,
    handleSubmit,
    control,
    clearErrors,
    formState: { isDirty, errors, isSubmitting },
  } = useForm({
    mode: 'onChange'
  })

  const { mutateAsync } = useEditMutation(publicKey, () => setRefresh(true))
  const [defaultValues, setDefaultValues] = useState({
    lowerLimit: cometDetail.lowerLimit,
    upperLimit: cometDetail.upperLimit,
    mintRatio: 0,
    healthScore: 0,
    maxWithdrawable: 0,
    maxUsdiPosition: 0,
  })

  const [maxMintable, setMaxMintable] = useState(0.0)
  const [defaultMintRatio, setDefaultMintRatio] = useState(0)
  const [mintRatio, setMintRatio] = useState(0)
  const [healthScore, setHealthScore] = useState(0)
  const [maxWithdrawable, setMaxWithdrawable] = useState(0)
  const [newAggLiquidity, setNewAggLiquidity] = useState(0)
  const [currentAggLiquidity, setCurrentAggLiquidity] = useState(0)
  const [tokenDataState, setTokenDataState] = useState<TokenData | null>(null);
  const [singlePoolCometState, setSinglePoolCometState] = useState<Comet | null>(null);

  const handleChangeType = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setEditType(newValue)
  }, [editType])

  const initData = () => {
    setCollAmount(NaN)
    setMintAmount(0.0)
  }

  const isCollAmountInvalid = (): boolean => {
    return isNaN(collAmount) || collAmount <= 0
  }

  // Initialize state data.
  useEffect(() => {
    async function fetch() {
      if (wallet) {
        const program = getInceptApp(wallet)
        await program.loadManager()

        const [tokenDataResult, cometResult] = await Promise.allSettled([
          program.getTokenData(), program.getSinglePoolComets()
        ]);

        if (tokenDataResult.status === "fulfilled" && cometResult.status === "fulfilled") {
          setTokenDataState(tokenDataResult.value)
          setSinglePoolCometState(cometResult.value)
        }
        setRefresh(false);
      }
    }
    if (refresh) fetch();
  }, [refresh, wallet])

  // set defaultMintRatio
  useEffect(() => {
    async function fetch() {
      if (open && wallet) {
        initData()

        let {
          maxCollateralWithdrawable,
          healthScore,
          maxUsdiPosition,
          lowerPrice,
          upperPrice
        } = calculateEditCometSinglePoolWithUsdiBorrowed(
          tokenDataState as TokenData,
          singlePoolCometState as Comet,
          cometIndex,
          0,
          0
        )

        const mintRatio = cometDetail.mintAmount * 100 / maxUsdiPosition
        setCometData({
          ...cometData,
          lowerLimit: healthScore < 100 ? Math.min(lowerPrice, assetData.centerPrice!) : 0,
          upperLimit: healthScore < 100 ? Math.max(upperPrice, assetData.centerPrice!) : Infinity
        })
        setHealthScore(Math.max(0, healthScore))
        setMaxWithdrawable(Math.abs(maxCollateralWithdrawable))
        setDefaultMintRatio(maxUsdiPosition > 0 ? mintRatio : 0)
        setMintRatio(maxUsdiPosition > 0 ? mintRatio : 0)
        setMintAmount(cometDetail.mintAmount)

        setDefaultValues({
          lowerLimit: lowerPrice,
          upperLimit: upperPrice,
          healthScore: healthScore,
          maxWithdrawable: Math.abs(maxCollateralWithdrawable),
          maxUsdiPosition: maxUsdiPosition,
          mintRatio: mintRatio,
        })
      }
    }
    fetch()
  }, [open, wallet])

  // set default when changing editType
  useEffect(() => {
    if (defaultValues) {
      initData()

      setCometData({
        ...cometData,
        lowerLimit: defaultValues.lowerLimit,
        upperLimit: defaultValues.upperLimit
      })
      setHealthScore(defaultValues.healthScore)
      setMaxWithdrawable(defaultValues.maxWithdrawable)
      setDefaultMintRatio(defaultValues.maxUsdiPosition > 0 ? defaultValues.mintRatio : 0)
      setMintRatio(defaultValues.maxUsdiPosition > 0 ? defaultValues.mintRatio : 0)
      setMintAmount(cometDetail.mintAmount)
      setCurrentAggLiquidity(cometDetail.mintAmount * 2)
    }
  }, [editType])

  // Trigger on collAmount
  useEffect(() => {
    function fetch() {
      if (isCollAmountInvalid() || !wallet) return

      if (open && tokenDataState && singlePoolCometState) {
        const collateralChange = editType === 0 ? collAmount : -1 * collAmount

        let {
          maxCollateralWithdrawable,
          lowerPrice,
          upperPrice,
          maxUsdiPosition,
          healthScore,
        } = calculateEditCometSinglePoolWithUsdiBorrowed(
          tokenDataState,
          singlePoolCometState,
          cometIndex,
          collateralChange,
          0
        )
        setHealthScore(Math.max(0, healthScore))
        setMaxWithdrawable(Math.abs(maxCollateralWithdrawable))
        setMaxMintable(maxUsdiPosition)
        setCometData({
          ...cometData,
          lowerLimit: healthScore < 100 ? Math.min(lowerPrice, assetData.centerPrice!) : 0,
          upperLimit: healthScore < 100 ? Math.max(upperPrice, assetData.centerPrice!) : Infinity
        })
        const newDefaultMintRatio = maxUsdiPosition > 0 ? cometDetail.mintAmount * 100 / maxUsdiPosition : 0;
        setDefaultMintRatio(newDefaultMintRatio)
        setMintRatio(newDefaultMintRatio)
        setMintAmount(cometDetail.mintAmount)
        setNewAggLiquidity(cometDetail.mintAmount * 2)
      }
    }
    fetch()
  }, [collAmount])

  // Trigger on mintAmount
  useEffect(() => {
    function fetch() {
      if (!wallet) return

      if (open && tokenDataState && singlePoolCometState) {
        console.log('calculateRange', collAmount, mintAmount, cometDetail.mintAmount)

        const collateralChange = editType === 0 ? collAmount : -1 * collAmount

        let {
          maxCollateralWithdrawable,
          lowerPrice,
          upperPrice,
          maxUsdiPosition,
          healthScore,
        } = calculateEditCometSinglePoolWithUsdiBorrowed(
          tokenDataState,
          singlePoolCometState,
          cometIndex,
          collateralChange,
          mintAmount - cometDetail.mintAmount
        )
        setHealthScore(Math.max(0, healthScore))
        setMaxWithdrawable(Math.abs(maxCollateralWithdrawable))
        setMaxMintable(maxUsdiPosition)
        setCometData({
          ...cometData,
          lowerLimit: healthScore < 100 ? Math.min(lowerPrice, assetData.centerPrice!) : 0,
          upperLimit: healthScore < 100 ? Math.max(upperPrice, assetData.centerPrice!) : Infinity
        })
        const newDefaultMintRatio = maxUsdiPosition > 0 ? cometDetail.mintAmount * 100 / maxUsdiPosition : 0;
        setDefaultMintRatio(newDefaultMintRatio)
        setNewAggLiquidity(mintAmount * 2)
      }
    }
    fetch()
  }, [mintRatio])

  useEffect(() => {
    trigger()
  }, [collAmount])

  const validateCollAmount = () => {
    if (!isDirty || collAmount < 0) {
      clearErrors('collAmount')
      return
    }
    if ((editType === 0 && collAmount > balance) || (editType === 1 && collAmount > maxWithdrawable)) {
      return 'The collateral amount cannot exceed the balance.'
    }
    if (collAmount <= 0) {
      return 'The collateral amount should be greater than 0'
    }
  }

  const onCollAmountInputChange = (val: number, field: ControllerRenderProps<FieldValues, "collAmount">) => {
    setCollAmount(val)
    field.onChange(val)
  }

  const formHasErrors = (): boolean => {
    if (errors.collAmount && errors.collAmount.message !== "") {
      return true
    }
    return false
  }

  const disableSubmitButton = (): boolean => {
    if (!isDirty || formHasErrors() || healthScore <= 0 || isCollAmountInvalid()) {
      return true
    }
    return false
  }

  const handleChangeMintRatio = useCallback((newRatio: number) => {
    const mintAmount = calculateMintAmount(maxMintable, newRatio)
    setMintAmount(mintAmount)
    setMintRatio(newRatio)
  }, [mintRatio, mintAmount])

  const handleChangeMintAmount = useCallback((mintAmount: number) => {
    setMintAmount(mintAmount)
    setMintRatio(maxMintable > 0 ? mintAmount * 100 / maxMintable : 0)
  }, [mintRatio, mintAmount])

  const onEdit = async () => {
    // setLoading(true)
    await mutateAsync(
      {
        cometIndex,
        collAmount,
        mintAmountChange: mintAmount - cometDetail.mintAmount,
        editType
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            // enqueueSnackbar('Successfully modified comet position')
            initData()
            onRefetchData()
            onHideEditForm()
          }
          // setLoading(false)
        },
        onError(err) {
          console.error(err)
          // enqueueSnackbar('Error modifying comet position')
          // setLoading(false)
        }
      }
    )
  }

  const hasRiskScore = healthScore < RISK_SCORE_VAL

  return (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}

      <Dialog open={open} onClose={onHideEditForm} TransitionComponent={FadeTransition} maxWidth={1000}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b', overflow: 'hidden' }}>
          <BoxWrapper>
            <Box padding='15px 10px'>
              <Box>
                <Typography variant='p_xlg'>Edit Comet Position</Typography>
              </Box>
              <StyledDivider />
              <Stack direction='row' gap={5}>
                <EqualBox>
                  <Box>
                    <Box mb='14px'><Typography variant='h8'>Adjust Collateral Amount</Typography></Box>
                    <Controller
                      name="collAmount"
                      control={control}
                      rules={{
                        validate(value) {
                          return validateCollAmount()
                        }
                      }}
                      render={({ field }) => (
                        <EditCollateralInput
                          editType={editType}
                          tickerIcon={'/images/assets/USDi.png'}
                          tickerSymbol="USDi"
                          collAmount={isNaN(collAmount) ? 0 : collAmount}
                          collAmountDollarPrice={collAmount}
                          maxCollVal={editType === 0 ? balance : maxWithdrawable}
                          currentCollAmount={cometDetail.collAmount}
                          dollarPrice={cometDetail.collAmount}
                          onChangeType={handleChangeType}
                          onChangeAmount={(evt: React.ChangeEvent<HTMLInputElement>) => onCollAmountInputChange(parseFloat(evt.currentTarget.value), field)}
                          onMax={(amount: number) => onCollAmountInputChange(amount, field)}
                        />
                      )}
                    />
                    <FormHelperText error={!!errors.collAmount?.message}>{errors.collAmount?.message}</FormHelperText>
                  </Box>
                  <StyledDivider />
                  <Box>
                    <Box>
                      <Typography variant='h8'>
                        Adjust Liquidity to mint into USDi / {assetData.tickerSymbol} Pool
                      </Typography>
                    </Box>
                    <Box mt='25px'>
                      <EditRatioSlider min={0} max={100} ratio={mintRatio} currentRatio={defaultMintRatio} assetData={assetData} mintAmount={mintAmount} currentMintAmount={cometDetail.mintAmount} onChangeRatio={handleChangeMintRatio} onChangeAmount={handleChangeMintAmount} />
                    </Box>
                  </Box>
                  <BoxWithBorder mt='14px'>
                    <Stack direction='row' justifyContent='space-between' padding='15px'>
                      <Box><Typography variant='p'>New Aggregate Liquidity Value</Typography></Box>
                      <Box><Typography variant='p_xlg'>${newAggLiquidity.toLocaleString()}</Typography></Box>
                    </Stack>
                    <Box borderTop='1px solid #3f3f3f' padding='5px 7px' display='flex' justifyContent='center'>
                      <Typography variant='p' color='#989898'>Current Aggregate Liquidity Value: </Typography>
                      <Typography variant='p' ml='5px'>${currentAggLiquidity.toLocaleString()} USD</Typography>
                    </Box>
                  </BoxWithBorder>
                </EqualBox>
                <EqualBox>
                  <Box><Typography variant='h8'>Projected Values</Typography></Box>
                  <BoxWithBorder mt='13px' padding='6px 19px'>
                    <Box>
                      <Box><Typography variant='p'>Projected Liquidity Concentration Range</Typography> <InfoTooltip title={TooltipTexts.projectedLiquidityConcRange} /></Box>
                      <EditConcentrationRangeBox assetData={assetData} cometData={cometData} currentLowerLimit={cometData.lowerLimit} currentUpperLimit={cometData.upperLimit} />
                    </Box>
                    <Box mt='20px' mb='10px'>
                      <Box><Typography variant='p'>Projected Healthscore</Typography> <InfoTooltip title={TooltipTexts.projectedHealthScore} /></Box>
                      <HealthscoreBar score={healthScore} prevScore={defaultValues.healthScore} hideIndicator={true} width={430} />
                      {hasRiskScore &&
                        <WarningMsg> This position will have high possibility to become subject to liquidation. </WarningMsg>
                      }
                    </Box>
                  </BoxWithBorder>
                  <SubmitButton onClick={handleSubmit(onEdit)} disabled={disableSubmitButton() || isSubmitting} sx={hasRiskScore ? { backgroundColor: '#ff8e4f' } : {}}>
                    <Typography variant='p_lg'>{hasRiskScore && 'Accept Risk and '} Edit Comet Position</Typography>
                  </SubmitButton>
                  <Box display='flex' justifyContent='center'>
                    <DataLoadingIndicator />
                  </Box>
                </EqualBox>
              </Stack>
            </Box>
          </BoxWrapper>
        </DialogContent>
      </Dialog >
    </>
  )
}

const BoxWrapper = styled(Box)`
  padding: 8px 1px; 
  color: #fff;
  overflow-x: hidden;
`
const EqualBox = styled(Box)`
  flex: 1 1 0;
  width: 440px;
  min-width: 400px;
`
const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`

export default EditDetailDialog