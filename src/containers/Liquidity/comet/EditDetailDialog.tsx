import React, { useState, useCallback } from 'react'
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
// import { useBalanceQuery } from '~/features/Comet/Balance.query'
import { useEditMutation } from '~/features/Comet/Comet.mutation'
import EditRatioSlider from '~/components/Liquidity/comet/EditRatioSlider'
import EditCollateralInput from '~/components/Liquidity/comet/EditCollateralInput'
import { useForm, Controller } from 'react-hook-form'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'

const EditDetailDialog = ({ cometId, assetData, cometDetail, open, onHideEditForm }: any) => {
  const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const cometIndex = parseInt(cometId)

  const { mutateAsync } = useEditMutation(publicKey)
  // const { data: usdiBalance } = useBalanceQuery({ 
  //   userPubKey: publicKey, 
  //   refetchOnMount: true,
  //   enabled: publicKey != null
  // });

  const [editType, setEditType] = useState(0) // 0 : deposit , 1: withdraw
  const maxCollVal = cometDetail.maxCollValue
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
      collAmount: cometDetail.collAmount,
      mintAmount: cometDetail.mintAmount,
    }
	})
  const [collAmount, mintAmount] = watch([
		'collAmount',
		'mintAmount',
	])

  // TODO:
  const maxMintable = 5;

  const defaultMintRatio = cometDetail.mintAmount * 100 / maxMintable
  const [mintRatio, setMintRatio] = useState(defaultMintRatio)

  const handleChangeType = useCallback((event: React.SyntheticEvent, newValue: number) => {
		setEditType(newValue)
	}, [editType])

  const calculateRange = async (amount: number) => {
    const program = getInceptApp()
    let [lowerLimit, upperLimit] = (await program.calculateRangeFromUSDiAndCollateral(
      0,
      (
        await program.getCometPosition(cometIndex)
      ).poolIndex,
      amount,
      mintAmount
    ))!
    if (lowerLimit && upperLimit) {
      setCometData({
        ...cometData,
        lowerLimit,
        upperLimit
      })
    }
  }

	const handleChangeFromAmount = useCallback( async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)
      await calculateRange(amount)
			
      setValue('collAmount', amount)
		} else {
			setValue('collAmount', 0.0)
		}
	}, [cometIndex, mintAmount, cometData])

  const handleChangeMax = async (amount: number) => {
    await calculateRange(amount)	
    setValue('collAmount', amount)
	}

  const handleChangeMintRatio = useCallback((newRatio: number) => {
    setMintRatio(newRatio)
    setValue('mintAmount', newRatio * maxMintable / 100)
	}, [mintRatio, mintAmount])

  const handleChangeMintAmount = useCallback((mintAmount: number) => {
    setMintRatio(mintAmount * 100 / maxMintable)
    setValue('mintAmount', mintAmount)
	}, [mintRatio, mintAmount])

	const handleChangeConcentRange = useCallback((lowerLimit: number, upperLimit: number) => {
		const newData = {
			...cometData,
			lowerLimit,
			upperLimit,
		}
		setCometData(newData)
	}, [cometData])

	const onEdit = async () => {
    setLoading(true)
    await mutateAsync(
      {
        cometIndex, 
        totalCollateralAmount: collAmount
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to comet')
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
                      onChangeAmount={handleChangeFromAmount}
                      onMax={handleChangeMax}
                    />
                  )}
                />
                <FormHelperText error={!!errors.collAmount?.message}>{errors.collAmount?.message}</FormHelperText>
              </Box>
              <StyledDivider />

              <Box>
                <SubTitle>
                  <Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Adjust <TxtPair>USDi</TxtPair> & <TxtPair>{assetData.tickerSymbol}</TxtPair> to minted into <TxtPair>{assetData.tickerSymbol} AMM</TxtPair></Box>
                </SubTitle>

                <Box sx={{ marginTop: '20px' }}>
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

              <ActionButton onClick={handleSubmit(onEdit)} disabled={!isDirty || !isValid}>Edit Collateral</ActionButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

const WarningBox = styled(Box)`
	max-width: 507px;
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