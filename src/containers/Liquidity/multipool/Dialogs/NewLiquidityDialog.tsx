import React, { useState, useEffect } from 'react'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { Box, styled, Button, Stack, Dialog, FormHelperText, DialogContent, IconButton } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import RatioSlider from '~/components/Liquidity/multipool/RatioSlider'
import { SliderTransition } from '~/components/Common/Dialog'
import SelectedPoolBox from '~/components/Liquidity/multipool/SelectedPoolBox'
import PairInput from '~/components/Asset/PairInput'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { useLiquidityDetailQuery } from '~/features/MyLiquidity/multipool/LiquidityPosition.query'
import { useNewPositionMutation } from '~/features/MyLiquidity/multipool/LiquidityPosition.mutation'
import PairInputView from '~/components/Asset/PairInputView'
import { useForm, Controller } from 'react-hook-form'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'

const NewLiquidityDialog = ({ open, assetIndex, onRefetchData, handleClose }:  { open: boolean, assetIndex: number, onRefetchData: any, handleClose: any }) => {
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
    enabled: open && publicKey != null
	})

  useEffect(() => {
    if (open && positionInfo !== undefined) {
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

  return positionInfo ? (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={960}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '5px 15px' }}>
          <Box sx={{ padding: '8px 18px', color: '#fff' }}>
            <Stack direction="row" justifyContent='space-between' alignItems='center'>
              <IconButton sx={{ color: '#fff' }} onClick={handleClose}><ChevronLeftIcon /></IconButton>
              <HeaderText>Establish New Liquidity Position</HeaderText>
              <Box> </Box>
            </Stack>
            <Divider />

            <Stack direction='row' gap={4}>
              <SelectedPoolBox positionInfo={positionInfo}  />
              
              <Box sx={{ minWidth: '550px', padding: '8px 18px', color: '#fff' }}>
                <SelectLabel>Select amount of USDi & {positionInfo.tickerSymbol} to mint into {positionInfo.tickerSymbol} AMM</SelectLabel>
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
                        if (!value || value < 0) {
                          return ''
                        }
                      }
                    }}
                    render={({ field }) => (
                      <PairInput
                        tickerIcon={'/images/assets/USDi.png'}
                        tickerName="USDi Coin"
                        tickerSymbol="USDi"
                        value={parseFloat(field.value.toFixed(3))}
                        headerTitle="Max amount mintable"
                        headerValue={maxMintable}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          let mintVal = parseFloat(event.currentTarget.value)
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
                <PairInputView
                  tickerIcon={positionInfo.tickerIcon}
                  tickerSymbol={positionInfo.tickerSymbol}
                  value={mintAmount / positionInfo.price}
                />

                <FormStack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>Total liquidity value of the position: </Box>
                  <Box sx={{ fontSize: '16px' }}>${totalLiquidity.toLocaleString()}</Box>
                </FormStack>

                <Divider />
                <Box>
                  <Box sx={{ fontSize: '12px', fontWeight: '600', color: '#acacac', marginLeft: '9px' }}>Projected Multipool Health Score <InfoTooltip title="Projected Multipool Health Score" /></Box>
                  <Box sx={{ fontSize: '20px', fontWeight: '500', textAlign: 'center' }}><span style={{fontSize: '32px', fontWeight: 'bold'}}>{healthScore.toFixed(2)}</span>/100</Box>
                </Box>
                <Divider />

                <NewPositionButton onClick={handleSubmit(onNewLiquidity)} disabled={!(isValid && validMintValue)}>Establish New Position</NewPositionButton>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  ) : <></>
}

const HeaderText = styled(Box)`
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: #fff;
`

const Divider = styled('div')`
  width: 100%;
  height: 1px;
  margin-top: 17px;
  margin-bottom: 10px;
  background-color: #2c2c2c;
`

const FormStack = styled(Stack)`
	display: flex;
	width: 100%;
	height: 45px;
	padding: 9px 21px 8px 24px;
  background: rgba(21, 22, 24, 0.75);
	border-radius: 8px;
	border: solid 1px #5c5c5c;
  margin-top: 20px;
  margin-bottom: 15px;
  font-size: 12px;
  font-weight: 500;
`

const SelectLabel = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
`

const NewPositionButton = styled(Button)`
	width: 100%;
	background-color: #4e3969;
	color: #fff;
	border-radius: 10px;
  margin-top: 10px;
	margin-bottom: 15px;
  font-size: 14px;
  font-weight: 600;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

export default NewLiquidityDialog

