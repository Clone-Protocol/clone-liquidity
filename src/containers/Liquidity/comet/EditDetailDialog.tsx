import React, { useState, useCallback, useEffect } from 'react'
import { Box, Divider, styled, Button, Dialog, DialogContent, FormHelperText } from '@mui/material'
import { useSnackbar } from 'notistack'
import Image from 'next/image'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as PI, CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import EditConcentrationRangeBox from '~/components/Liquidity/comet/EditConcentrationRangeBox'
import { CometInfo } from '~/features/MyLiquidity/CometPosition.query'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import { useEditMutation } from '~/features/Comet/Comet.mutation'
import EditRatioSlider from '~/components/Liquidity/comet/EditRatioSlider'
import EditCollateralInput from '~/components/Liquidity/comet/EditCollateralInput'
import { useForm, Controller, ControllerRenderProps, FieldValues } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import throttle from 'lodash.throttle'
import { SliderTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TokenData, Comet } from 'incept-protocol-sdk/sdk/src/incept'
import { TooltipTexts } from '~/data/tooltipTexts'

const EditDetailDialog = ({ cometId, balance, assetData, cometDetail, open, onHideEditForm, onRefetchData }: { cometId: number, balance: number, assetData: PI, cometDetail: CometDetail, open: boolean, onHideEditForm: () => void, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const { getInceptApp } = useIncept()
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

  const mutateRefresh = () => {
    setRefresh(true)
  }
  
  const { mutateAsync } = useEditMutation(publicKey, () => mutateRefresh())
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
  const [tokenDataState, setTokenDataState] = useState<TokenData | null>(null);
  const [singlePoolCometState, setSinglePoolCometState] = useState<Comet | null>(null);

  const handleChangeType = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setEditType(newValue)
  }, [editType])

  const initData = () => {
    setCollAmount(NaN)
    setMintAmount(0.0)
  }

  // Initialize state data.
  useEffect(() => {
    async function fetch() {
      const program = getInceptApp()
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
    if (refresh) fetch();
  }, [refresh])

  // set defaultMintRatio
  useEffect(() => {
    async function fetch() {
      if (open) {
        const program = getInceptApp()

        initData()

        let {
          maxCollateralWithdrawable,
          healthScore,
          maxUsdiPosition,
          lowerPrice,
          upperPrice
        } = program.calculateEditCometSinglePoolWithUsdiBorrowed(
          tokenDataState as TokenData,
          singlePoolCometState as Comet,
          cometIndex,
          0,
          0
        )

        const mintRatio = cometDetail.mintAmount * 100 / maxUsdiPosition

        setCometData({
          ...cometData,
          lowerLimit: healthScore < 100 ? Math.min(lowerPrice, assetData.centerPrice) : 0,
          upperLimit: healthScore < 100 ? Math.max(upperPrice, assetData.centerPrice) : Infinity
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
  }, [open])

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
    }
  }, [editType])

  // Trigger on collAmount
  useEffect(() => {
    function fetch() {
      const program = getInceptApp()

      if (open && tokenDataState && singlePoolCometState) {

        const collateralChange = editType === 0 ? collAmount : -1 * collAmount

        let {
          maxCollateralWithdrawable,
          lowerPrice,
          upperPrice,
          maxUsdiPosition,
          healthScore,
        } = program.calculateEditCometSinglePoolWithUsdiBorrowed(
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
          lowerLimit: healthScore < 100 ? Math.min(lowerPrice, assetData.centerPrice) : 0,
          upperLimit: healthScore < 100 ? Math.max(upperPrice, assetData.centerPrice) : Infinity
        })
        const newDefaultMintRatio = maxUsdiPosition > 0 ? cometDetail.mintAmount * 100 / maxUsdiPosition : 0;
        setDefaultMintRatio(newDefaultMintRatio)
        setMintRatio(newDefaultMintRatio)
        setMintAmount(cometDetail.mintAmount)
      }
    }
    fetch()
  }, [collAmount])

  // Trigger on mintAmount
  useEffect(() => {
    function fetch() {
      const program = getInceptApp()

      if (open && tokenDataState && singlePoolCometState) {
        console.log('calculateRange', collAmount, mintAmount, cometDetail.mintAmount)

        const collateralChange = editType === 0 ? collAmount : -1 * collAmount

        let {
          maxCollateralWithdrawable,
          lowerPrice,
          upperPrice,
          maxUsdiPosition,
          healthScore,
        } = program.calculateEditCometSinglePoolWithUsdiBorrowed(
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
          lowerLimit: healthScore < 100 ? Math.min(lowerPrice, assetData.centerPrice) : 0,
          upperLimit: healthScore < 100 ? Math.max(upperPrice, assetData.centerPrice) : Infinity
        })
        const newDefaultMintRatio = maxUsdiPosition > 0 ? cometDetail.mintAmount * 100 / maxUsdiPosition : 0;
        setDefaultMintRatio(newDefaultMintRatio)
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
    if (!isDirty || formHasErrors() || healthScore <= 0) {
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
    setMintRatio( maxMintable > 0 ? mintAmount * 100 / maxMintable : 0)
  }, [mintRatio, mintAmount])

  const onEdit = async () => {
    setLoading(true)
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
            enqueueSnackbar('Successfully modified comet position')
            initData()
            onRefetchData()
            onHideEditForm()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Error modifying comet position')
          setLoading(false)
        }
      }
    )
  }

  return (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}

      <Dialog open={open} onClose={onHideEditForm} TransitionComponent={SliderTransition}>
        <DialogContent sx={{ backgroundColor: '#16171a' }}>
          <BoxWrapper>
            <WarningBox>
              If you are unclear about how to edit your Comet, click here to learn more.
            </WarningBox>

            <Box padding='15px 10px'>
              <Box>
                <SubTitle>
                  <Image src={OneIcon} /> <Box marginLeft='9px'>Adjust Collateral</Box>
                </SubTitle>
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
                      collAmount={isNaN(collAmount) ? '' : collAmount}
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
                <SubTitle>
                  <Image src={TwoIcon} /> <Box marginLeft='9px'>Adjust <TxtPair>USDi</TxtPair> & <TxtPair>{assetData.tickerSymbol}</TxtPair> to mint into <TxtPair>{assetData.tickerSymbol} AMM</TxtPair></Box>
                </SubTitle>

                <Box marginTop='25px'>
                  <EditRatioSlider min={0} max={100} ratio={mintRatio} currentRatio={defaultMintRatio} assetData={assetData} mintAmount={mintAmount} currentMintAmount={cometDetail.mintAmount} onChangeRatio={handleChangeMintRatio} onChangeAmount={handleChangeMintAmount} />
                </Box>
              </Box>
              <StyledDivider />

              <Box>
                <SubTitle>
                  <Box marginLeft='9px'>Projected Liquidity Concentration Range <InfoTooltip title={TooltipTexts.projectedLiquidityConcRange} /></Box>
                </SubTitle>

                <EditConcentrationRangeBox assetData={assetData} cometData={cometData} currentLowerLimit={cometData.lowerLimit} currentUpperLimit={cometData.upperLimit} />
              </Box>
              <StyledDivider />

              <Box>
                <HealthScoreTitle>Projected Healthscore <InfoTooltip title={TooltipTexts.projectedHealthScore} /></HealthScoreTitle>
                <HealthScoreValue><span style={{ fontSize: '32px', fontWeight: 'bold' }}>{isNaN(healthScore) ? 0 : healthScore.toFixed(2)}</span>/100</HealthScoreValue>
              </Box>

              <StyledDivider />

              <ActionButton onClick={handleSubmit(onEdit)} disabled={disableSubmitButton() || isSubmitting}>Edit Comet</ActionButton>
            </Box>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}

const BoxWrapper = styled(Box)`
  padding: 8px 1px; 
  color: #fff;
  overflow-x: hidden;
`
const WarningBox = styled(Box)`
	max-width: 520px;
  height: 42px;
	font-size: 11px;
	font-weight: 500;
  line-height: 42px;
	color: #989898;
  border-radius: 10px;
  border: solid 1px #809cff;
  background-color: rgba(128, 156, 255, 0.09);
  text-align: center;
  margin: 0 auto;
`
const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 20px;
	margin-top: 20px;
	height: 1px;
`
const SubTitle = styled('div')`
	display: flex;
	font-size: 14px;
	font-weight: 500;
	margin-bottom: 17px;
	color: #fff;
`
const TxtPair = styled('span')`
  color: #809cff;
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

const ActionButton = styled(Button)`
	width: 100%;
	background: #4e609f;
	color: #fff;
	border-radius: 8px;
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

export default EditDetailDialog