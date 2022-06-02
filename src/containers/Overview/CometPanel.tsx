import { Box, Stack, Button, Divider, FormHelperText } from '@mui/material'
import React, { useState, useEffect, useCallback } from 'react'
import { styled } from '@mui/system'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import InfoBookIcon from 'public/images/info-book-icon.png'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import ThreeIcon from 'public/images/three-icon.svg'
import PairInput from '~/components/Asset/PairInput'
import PairInputView from '~/components/Asset/PairInputView'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import ConcentrationRangeBox from '~/components/Liquidity/comet/ConcentrationRangeBox'
import RatioSlider from '~/components/Asset/RatioSlider'
import { LoadingProgress } from '~/components/Common/Loading'
import { CometInfo, PositionInfo } from '~/features/MyLiquidity/CometPosition.query'
import { useCometMutation } from '~/features/Comet/Comet.mutation'
import withSuspense from '~/hocs/withSuspense'
import Image from 'next/image'
import { useForm, Controller } from 'react-hook-form'
import { Balance } from '~/features/Borrow/Balance.query'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'

const CometPanel = ({ balances, assetData, assetIndex } : { balances: Balance, assetData: PositionInfo, assetIndex: number }) => {
  const { publicKey } = useWallet()
  const { getInceptApp } = useIncept()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)

  // TODO:
  const maxMintable = 5;
  
  const [mintRatio, setMintRatio] = useState(50)
  const [cometData, setCometData] = useState<CometInfo>({
    isTight: false,
    lowerLimit: 40.0,
    upperLimit: 180.0
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
      mintAmount: maxMintable * mintRatio / 100,
    }
	})
  const [collAmount, mintAmount] = watch([
		'collAmount',
		'mintAmount',
	])

  const { mutateAsync: mutateAsyncComet } = useCometMutation(publicKey)

  useEffect(() => {
    if (assetData) {
      setCometData({
        ...cometData,
        lowerLimit: assetData.price / 2,
        upperLimit: (assetData.price * 3) / 2
      })
    }
  }, [assetData])

  useEffect(() => {
    async function fetch() {
      if (collAmount && mintAmount) {
        console.log('calculateRange', collAmount +"/"+mintAmount)
        const program = getInceptApp()
        await program.loadManager()
        let [lowerLimit, upperLimit] = (await program.calculateRangeFromUSDiAndCollateral(
          0, // USDi
          assetIndex,
          collAmount,
          mintAmount
        ))!

        console.log('l', lowerLimit)
        console.log('u', upperLimit)
        // if (lowerLimit && upperLimit) {
          setCometData({
            ...cometData,
            lowerLimit,
            upperLimit
          })
        // }
      }
    }
    fetch()
  }, [collAmount, mintAmount])

	const handleChangeMintRatio = useCallback( async (event: Event, newValue: number | number[]) => {
	  if (typeof newValue === 'number') {
      setValue('mintAmount', maxMintable * newValue / 100)
      setMintRatio(newValue)
	  }
	}, [cometData])

	const handleChangeConcentRange = useCallback((isTight: boolean, lowerLimit: number, upperLimit: number) => {
		const newData = {
			...cometData,
			isTight,
			lowerLimit,
			upperLimit,
		}
		setCometData(newData)
	}, [cometData])

	const onComet = async () => {
    setLoading(true)
    await mutateAsyncComet(
      {
        collateralIndex: 0, //USDi
        iassetIndex: assetIndex,
        usdiAmount: mintAmount,
        collateralAmount: collAmount,
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to comet')
            setLoading(false)
          }
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
    
      <Box>
        <PriceIndicatorBox
          tickerIcon={assetData.tickerIcon}
          tickerName={assetData.tickerName}
          tickerSymbol={assetData.tickerSymbol}
          value={assetData.price}
        />

        <Box sx={{ background: 'rgba(21, 22, 24, 0.75)', paddingX: '32px', paddingY: '24px', marginTop: '28px', borderRadius: '10px' }}>
          <Stack
            sx={{
              background: 'rgba(128, 156, 255, 0.09)',
              border: '1px solid #809cff',
              borderRadius: '10px',
              color: '#809cff',
              padding: '8px',
              marginBottom: '26px',
            }}
            direction="row">
            <Box sx={{ width: '73px', textAlign: 'center', marginTop: '6px' }}>
              <Image src={InfoBookIcon} />
            </Box>
            <WarningBox>
              Fill in two of the three parts and the third part will automatically generate.{' '}
              <br />Learn more <span style={{ textDecoration: 'underline' }}>here</span>.
            </WarningBox>
          </Stack>

          <Box>
            <SubTitle>
              <Image src={OneIcon} />{' '}
              <Box sx={{ marginLeft: '9px' }}>Provide stable coins to collateralize</Box>
            </SubTitle>
            <Controller
              name="collAmount"
              control={control}
              rules={{
                validate(value) {
                  if (!value || value <= 0) {
                    return 'the collateral amount should be above zero.'
                  } else if (value > balances?.usdiVal) {
                    return 'The collateral amount cannot exceed the balance.'
                  }
                }
              }}
              render={({ field }) => (
                <PairInput
                  tickerIcon={'/images/assets/USDi.png'}
                  tickerName="USDi Coin"
                  tickerSymbol="USDi"
                  value={field.value}
                  headerTitle="Balance"
                  headerValue={balances?.usdiVal}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(parseFloat(event.currentTarget.value))
                  }}
                  onMax={(value: number) => {
                    field.onChange(value)
                  }}
                />
              )}
            />
            <FormHelperText error={!!errors.collAmount?.message}>{errors.collAmount?.message}</FormHelperText>
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>
              <Image src={TwoIcon} />{' '}
              <Box sx={{ marginLeft: '9px' }}>
                Amount of USDi & {assetData.tickerSymbol} to mint into {assetData.tickerSymbol}{' '}
                AMM
              </Box>
            </SubTitle>
            <Box sx={{ marginTop: '15px' }}>
              <RatioSlider min={0} max={100} value={mintRatio} hideValueBox onChange={handleChangeMintRatio} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '-8px'}}>
                <Box sx={{ fontSize: '11px', fontWeight: '500' }}>Min</Box>
                <Box sx={{ fontSize: '11px', fontWeight: '500' }}>Max</Box>
              </Box>
            </Box>
            <Box sx={{ marginBottom: '25px', marginTop: '15px' }}>
              <Controller
                name="mintAmount"
                control={control}
                rules={{
                  validate(value) {
                    if (!value || value <= 0) {
                      return 'the mint amount should be above zero'
                    }
                  }
                }}
                render={({ field }) => (
                  <PairInput
                    tickerIcon={'/images/assets/USDi.png'}
                    tickerName="USDi Coin"
                    tickerSymbol="USDi"
                    value={field.value}
                    headerTitle="Max amount mintable"
                    headerValue={maxMintable}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const mintVal = parseFloat(event.currentTarget.value)
                      field.onChange(mintVal)
                      setMintRatio(mintVal * 100 / maxMintable)
                    }}
                    onMax={(value: number) => {
                      field.onChange(value)
                      setMintRatio(value * 100 / maxMintable)
                    }}
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
              <Image src={ThreeIcon} />{' '}
              <Box sx={{ marginLeft: '9px' }}>Liquidity concentration range</Box>
            </SubTitle>

            <Box sx={{ marginTop: '110px', marginBottom: '15px' }}>
              <ConcentrationRange
                assetData={assetData}
                cometData={cometData}
                onChange={handleChangeConcentRange}
                max={assetData.maxRange}
                defaultLower={(assetData.price / 2)}
                defaultUpper={((assetData.price * 3) / 2)}
              />
            </Box>

            <ConcentrationRangeBox assetData={assetData} cometData={cometData} />

            {/* {assetData.tightRange > assetData.price - cometData.lowerLimit ||
            assetData.tightRange > cometData.upperLimit - assetData.price ? (
              <Stack
                sx={{
                  maxWidth: '653px',
                  background: 'rgba(128, 156, 255, 0.09)',
                  border: '1px solid #e9d100',
                  borderRadius: '10px',
                  color: '#9d9d9d',
                  padding: '12px',
                  marginTop: '19px',
                  marginBottom: '30px',
                }}
                direction="row">
                <Box sx={{ width: '53px', textAlign: 'center', marginTop: '11px' }}>
                  <Image src={WarningIcon} />
                </Box>
                <WarningBox>
                  Liquidity concentration range for this position is very slim, this results
                  in higher potential yield and high probabily of liqudiation.
                </WarningBox>
              </Stack>
            ) : (
              <></>
            )} */}
          </Box>
          <StyledDivider />

          <CometButton onClick={handleSubmit(onComet)} disabled={!isDirty || !isValid}>Create Comet Position</CometButton>
        </Box>
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

const CometButton = styled(Button)`
	width: 100%;
	background-color: #4e609f;
	color: #fff;
	border-radius: 10px;
	margin-bottom: 15px;
  font-size: 13px;
  font-weight: 600;
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

export default withSuspense(CometPanel, <LoadingProgress />)
