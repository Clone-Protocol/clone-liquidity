import React, { useState, useCallback, useEffect } from 'react'
import { Box, Divider, styled, Button, Dialog, DialogContent, FormHelperText } from '@mui/material'
import { useSnackbar } from 'notistack'
import Image from 'next/image'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import EditConcentrationRangeBox from '~/components/Liquidity/comet/EditConcentrationRangeBox'
import { CometInfo } from '~/features/MyLiquidity/CometPosition.query'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import { useEditMutation } from '~/features/Comet/Comet.mutation'
import EditRatioSlider from '~/components/Liquidity/comet/EditRatioSlider'
import EditCollateralInput from '~/components/Liquidity/comet/EditCollateralInput'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import throttle from 'lodash.throttle'
import { SliderTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'

const EditDetailDialog = ({ cometId, balance, assetData, cometDetail, open, onHideEditForm, onRefetchData }: any) => {
  const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const cometIndex = parseInt(cometId)

  const [editType, setEditType] = useState(0) // 0 : deposit , 1: withdraw
  const [cometData, setCometData] = useState<CometInfo>({
    isTight: false,
    lowerLimit: cometDetail.lowerLimit,
    upperLimit: cometDetail.upperLimit
  })

  const {
		handleSubmit,
		control,
    setValue,
		formState: { isDirty, errors },
		watch,
	} = useForm({
    mode: 'onChange',
    defaultValues: {
      collAmount: 0.0,
      mintAmount: 0.0,
    }
	})
  const [collAmount, mintAmount] = watch([
		'collAmount',
		'mintAmount',
	])

  const initData = () => {
    setValue('collAmount', 0.0)
    setValue('mintAmount', 0.0)
  }

  const { mutateAsync } = useEditMutation(publicKey)

  const [maxMintable, setMaxMintable] = useState(0.0)
  const [defaultMintRatio, setDefaultMintRatio] = useState(0)
  const [mintRatio, setMintRatio] = useState(0)
  const [healthScore, setHealthScore] = useState(0)
  const [maxWithdrawable, setMaxWithdrawable] = useState(0)

  const handleChangeType = useCallback((event: React.SyntheticEvent, newValue: number) => {
		setEditType(newValue)
	}, [editType])

  // set defaultMintRatio
  useEffect(() => {
    async function fetch() {
      if (open) {
        const program = getInceptApp()
        await program.loadManager()

        let {
          maxCollateralWithdrawable,
          healthScore,
          maxUsdiPosition,
          lowerPrice,
          upperPrice
        } = await program.calculateEditCometSinglePoolWithUsdiBorrowed(
          cometIndex,
          0,
          0
        )

        const mintRatio = cometDetail.mintAmount * 100 / maxUsdiPosition
        console.log('a', lowerPrice+"/"+upperPrice)
        console.log('b', maxUsdiPosition +"/"+maxCollateralWithdrawable + "/"+healthScore)
        console.log('c', cometDetail.mintAmount +"/"+ mintRatio)
        
        setCometData({
          ...cometData,
          lowerLimit: lowerPrice,
          upperLimit: upperPrice
        })
        setHealthScore(healthScore)
        setMaxWithdrawable(Math.abs(maxCollateralWithdrawable))
        setDefaultMintRatio(maxUsdiPosition > 0 ? mintRatio : 0)
        setMintRatio(maxUsdiPosition > 0 ? mintRatio : 0)
        setValue('mintAmount', cometDetail.mintAmount)
      }
    }
    fetch()
  }, [open])

  useEffect(() => {
    async function fetch() {
      const program = getInceptApp()
      await program.loadManager()

      if (open) {
        console.log('calculateRange', collAmount +"/"+mintAmount)

        let {
          maxCollateralWithdrawable,
          lowerPrice,
          upperPrice,
          maxUsdiPosition,
          healthScore,
        } = await program.calculateEditCometSinglePoolWithUsdiBorrowed(
          cometIndex,
          collAmount,
          mintAmount - cometDetail.mintAmount
        )
        setHealthScore(healthScore)
        setMaxWithdrawable(Math.abs(maxCollateralWithdrawable))
        setMaxMintable(maxUsdiPosition)
        setCometData({
          ...cometData,
          lowerLimit: lowerPrice,
          upperLimit: upperPrice
        })
        
        setDefaultMintRatio(maxUsdiPosition > 0 ? cometDetail.mintAmount * 100 / maxUsdiPosition : 0)
      }
    }
    fetch()
  }, [collAmount, mintAmount])

  const calculateMintAmount = useCallback( throttle ((mintAmount: number) => {
    setValue('mintAmount', mintAmount)
  }, 1000), [mintAmount])

  const handleChangeMintRatio = useCallback((newRatio: number) => {
    // setValue('mintAmount', newRatio * maxMintable / 100)
    calculateMintAmount(newRatio * maxMintable / 100)
    setMintRatio(newRatio)
	}, [mintRatio, mintAmount])

  const handleChangeMintAmount = useCallback((mintAmount: number) => {
    // setValue('mintAmount', mintAmount)
    calculateMintAmount(mintAmount)
    setMintRatio( maxMintable > 0 ? mintAmount * 100 / maxMintable : 0)
	}, [mintRatio, mintAmount])

  // throttling with call contract : (1sec)
  // const calculateUSDiAmountFromRange = useCallback( throttle(async (limit: number, isLeft: boolean) => {
  //   console.log('calculateUSDiAmount', limit +"/"+isLeft)
  //   const program = getInceptApp()
  //   await program.loadManager()

  //   const {
  //     usdiPosition,
  //   } = await program.calculateEditCometSinglePoolWithRange(
  //     cometIndex,
  //     collAmount,
  //     limit,
  //     isLeft,
  //   )
    
  //   setValue('mintAmount', usdiPosition)
  //   setMintRatio(usdiPosition * 100 / maxMintable)
  // }, 1000), [mintAmount])

	// const handleChangeConcentRange = useCallback((limit: number, isLeft: boolean) => {
  //   if (isLeft) {
  //     setCometData({
  //       ...cometData,
  //       lowerLimit: limit
  //     })
  //   } else {
  //     setCometData({
  //       ...cometData,
  //       upperLimit: limit
  //     })
  //   }
		
  //   if ((isLeft && (limit < assetData.price && limit > 0)) || (!isLeft && (limit > assetData.price))) {
  //     calculateUSDiAmountFromRange(limit, isLeft)
  //   }
	// }, [cometData])

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
            enqueueSnackbar('Success to comet')
            initData()
            onRefetchData()
            onHideEditForm()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to comet')
          setLoading(false)
        }
      }
    )
	}

  const isValid = Object.keys(errors).length === 0

  return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={onHideEditForm} TransitionComponent={SliderTransition}>
        <DialogContent sx={{ backgroundColor: '#16171a' }}>
          <Box sx={{ padding: '8px 1px', color: '#fff', overflowX: 'hidden' }}>
            <WarningBox>
              If you are unclear about how to edit your Comet, click here to learn more.
            </WarningBox>

            <Box sx={{ padding: '15px 10px' }}>
              <Box>
                <SubTitle>
                  <Image src={OneIcon} /> <Box sx={{ marginLeft: '9px' }}>Adjust Collateral</Box>
                </SubTitle>
                <Controller
                  name="collAmount"
                  control={control}
                  rules={{
                    validate(value) {
                      if (value < 0) {
                        return 'the collateral amount should be above zero.'
                      } else if ((editType === 0 && value > balance) || (editType === 1 && value > maxWithdrawable)) {
                        return 'The collateral amount cannot exceed the balance.'
                      }
                    }
                  }}
                  render={({ field }) => (
                    <EditCollateralInput
                      editType={editType}
                      tickerIcon={'/images/assets/USDi.png'}
                      tickerSymbol="USDi"
                      collAmount={field.value}
                      collAmountDollarPrice={field.value}
                      maxCollVal={editType === 0 ? balance : maxWithdrawable}
                      currentCollAmount={cometDetail.collAmount}
                      dollarPrice={cometDetail.collAmount}
                      onChangeType={handleChangeType}
                      onChangeAmount={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const collAmt = parseFloat(e.currentTarget.value)
                        field.onChange(collAmt)
                      }}
                      onMax={(amount: number) => {
                        field.onChange(amount)
                      }}
                    />
                  )}
                />
                <FormHelperText error={!!errors.collAmount?.message}>{errors.collAmount?.message}</FormHelperText>
              </Box>
              <StyledDivider />

              <Box>
                <SubTitle>
                  <Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Adjust <TxtPair>USDi</TxtPair> & <TxtPair>{assetData.tickerSymbol}</TxtPair> to mint into <TxtPair>{assetData.tickerSymbol} AMM</TxtPair></Box>
                </SubTitle>

                <Box sx={{ marginTop: '25px' }}>
                  <EditRatioSlider min={0} max={100} ratio={mintRatio} currentRatio={defaultMintRatio} assetData={assetData} mintAmount={mintAmount} currentMintAmount={cometDetail.mintAmount} onChangeRatio={handleChangeMintRatio} onChangeAmount={handleChangeMintAmount} />
                </Box>
              </Box>
              <StyledDivider />

              <Box>
                <SubTitle>
                  <Box sx={{ marginLeft: '9px' }}>Projected Liquidity Concentration Range <InfoTooltip title="Projected Liquidity Concentration Range" /></Box>
                </SubTitle>

                <EditConcentrationRangeBox assetData={assetData} cometData={cometData} currentLowerLimit={cometData.lowerLimit} currentUpperLimit={cometData.upperLimit} />
              </Box>
              <StyledDivider />

              <Box>
                <Box sx={{ fontSize: '14px', fontWeight: '500', marginLeft: '9px' }}>Projected Healthscore <InfoTooltip title="Projected Healthscore" /></Box>
                <Box sx={{ fontSize: '20px', fontWeight: '500', textAlign: 'center' }}><span style={{fontSize: '32px', fontWeight: 'bold'}}>{healthScore.toFixed(2)}</span>/100</Box>
              </Box>

              <StyledDivider />

              <ActionButton onClick={handleSubmit(onEdit)} disabled={!isValid}>Edit Comet</ActionButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

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