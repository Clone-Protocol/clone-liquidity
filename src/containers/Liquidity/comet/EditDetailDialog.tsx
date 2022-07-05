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
import ThreeIcon from 'public/images/three-icon.svg'
import { useEditMutation } from '~/features/Comet/Comet.mutation'
import EditRatioSlider from '~/components/Liquidity/comet/EditRatioSlider'
import EditCollateralInput from '~/components/Liquidity/comet/EditCollateralInput'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import throttle from 'lodash.throttle'

const EditDetailDialog = ({ cometId, balance, assetData, cometDetail, open, onHideEditForm, onRefetchData }: any) => {
  const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const cometIndex = parseInt(cometId)

  const COLLATERAL_INDEX = 0 // USDi
  const [editType, setEditType] = useState(0) // 0 : deposit , 1: withdraw
  const [maxCollVal, setMaxCollVal] = useState(balance)
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

  const [assetIndex, setAssetIndex] = useState(cometIndex)
  const [maxMintable, setMaxMintable] = useState(0.0)
  const [defaultMintRatio, setDefaultMintRatio] = useState(0)
  const [mintRatio, setMintRatio] = useState(0)
  const healthScore = 72

  const handleChangeType = useCallback((event: React.SyntheticEvent, newValue: number) => {
		setEditType(newValue)
    const maxColl = newValue === 0 ? balance : cometDetail.maxWithdrawable
    setMaxCollVal(maxColl)
	}, [editType])

  // defaultMintRatio
  useEffect(() => {
    async function fetch() {
      const program = getInceptApp()
      await program.loadManager()

      // const multiPoolComet = await program.getComet()
      // const assetIndex = multiPoolComet.positions[cometIndex].poolIndex
      const comet = await program.getSinglePoolComet(cometIndex);
      const position = comet.positions[0];
      const assetIndex = position.poolIndex;
      const max = await program.calculateMaxUSDiAmountFromCollateral(
        assetIndex,
        cometDetail.collAmount 
      )

      setAssetIndex(assetIndex)
      setDefaultMintRatio(max > 0 ? cometDetail.mintAmount * 100 / max : 0)
      setMintRatio(max > 0 ? cometDetail.mintAmount * 100 / max : 0)
    }
    fetch()
  }, [])

  useEffect(() => {
    async function fetch() {
      const program = getInceptApp()
      await program.loadManager()

      if (collAmount) {
        const max = await program.calculateMaxUSDiAmountFromCollateral(
          assetIndex,
          collAmount 
        )
        setMaxMintable(max)
      }

      if (collAmount && mintAmount) {
        console.log('calculateRange', collAmount +"/"+mintAmount)
        
        let [lowerLimit, upperLimit] = (await program.calculateRangeFromUSDiAndCollateral(
          COLLATERAL_INDEX, // USDi
          assetIndex,
          collAmount,
          mintAmount
        ))!

        setCometData({
          ...cometData,
          lowerLimit,
          upperLimit
        })
      }
    }
    fetch()
  }, [collAmount, mintAmount])

  const handleChangeMintRatio = useCallback((newRatio: number) => {
    setValue('mintAmount', newRatio * maxMintable / 100)
    setMintRatio(newRatio)
	}, [mintRatio, mintAmount])

  const handleChangeMintAmount = useCallback((mintAmount: number) => {
    setValue('mintAmount', mintAmount)
    setMintRatio( maxMintable > 0 ? mintAmount * 100 / maxMintable : 0)
	}, [mintRatio, mintAmount])

  // throttling with call contract : (1sec)
  const calculateUSDiAmountFromRange = useCallback( throttle(async (lowerLimit: number) => {
    console.log('calculateUSDiAmount', lowerLimit)
    const program = getInceptApp()
    await program.loadManager()

    const mintAmount = await program.calculateUSDiAmountFromRange(
      COLLATERAL_INDEX,
      assetIndex,
      collAmount,
      lowerLimit,
      true,
    )
    setValue('mintAmount', mintAmount)
  }, 1000), [mintAmount])

	const handleChangeConcentRange = useCallback((lowerLimit: number, upperLimit: number) => {
		const newData = {
			...cometData,
			lowerLimit,
			upperLimit,
		}
		setCometData(newData)
    calculateUSDiAmountFromRange(lowerLimit)
	}, [cometData])

	const onEdit = async () => {
    setLoading(true)
    await mutateAsync(
      {
        cometIndex, 
        collAmount,
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

      <Dialog open={open} onClose={onHideEditForm}>
        <DialogContent sx={{ backgroundColor: '#16171a' }}>
          <Box sx={{ padding: '8px 1px', color: '#fff' }}>
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
                      if (!value || value <= 0) {
                        return 'the collateral amount should be above zero.'
                      } else if (value > maxCollVal) {
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
                      maxCollVal={maxCollVal}
                      currentCollAmount={cometDetail.collAmount}
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
                  <Image src={ThreeIcon} /> <Box sx={{ marginLeft: '9px' }}>Adjust liquidity concentration range</Box>
                </SubTitle>

                <EditConcentrationRangeBox assetData={assetData} cometData={cometData} currentLowerLimit={cometDetail.lowerLimit} currentUpperLimit={cometDetail.upperLimit} onChange={handleChangeConcentRange} />
              </Box>
              <StyledDivider />

              <Box>
                <Box sx={{ fontSize: '14px', fontWeight: '500', marginLeft: '9px' }}>Projected Healthscore</Box>
                <Box sx={{ fontSize: '20px', fontWeight: '500', textAlign: 'center' }}><span style={{fontSize: '32px', fontWeight: 'bold'}}>{healthScore}</span>/100</Box>
              </Box>

              <StyledDivider />

              <ActionButton onClick={handleSubmit(onEdit)} disabled={!isDirty || !isValid}>Edit Comet</ActionButton>
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
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

export default EditDetailDialog