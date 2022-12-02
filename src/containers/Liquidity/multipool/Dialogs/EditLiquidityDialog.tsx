import React, { useState, useCallback, useEffect } from 'react'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { Box, styled, Button, Stack, Dialog, DialogContent, IconButton } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { SliderTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import SelectedPoolBox from '~/components/Liquidity/multipool/SelectedPoolBox'
import { useLiquidityDetailQuery } from '~/features/MyLiquidity/multipool/LiquidityPosition.query'
import { useEditPositionMutation } from '~/features/MyLiquidity/multipool/LiquidityPosition.mutation'
import { useForm } from 'react-hook-form'
import EditLiquidityRatioSlider from '~/components/Liquidity/multipool/EditLiquidityRatioSlider'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
 
const EditLiquidityDialog = ({ open, poolIndex, onRefetchData, handleClose }:  { open: boolean, poolIndex: number, onRefetchData: any, handleClose: any }) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const [defaultMintRatio, setDefaultMintRatio] = useState(0)
  const [defaultMintAmount, setDefaultMintAmount] = useState(0)
  const [mintRatio, setMintRatio] = useState(50)
  const [totalLiquidity, setTotalLiquidity] = useState(0)
  const [healthScore, setHealthScore] = useState(0)
  const [maxMintable, setMaxMintable] = useState(0)
  const [assetHealthCoefficient, setAssetHealthCoefficient] = useState(0)
  const [changeAmount, setChangeAmount] = useState(0)

  const { data: positionInfo, refetch } = useLiquidityDetailQuery({
    userPubKey: publicKey,
    index: poolIndex,
    isEdit: true,
	  refetchOnMount: true,
    enabled: open && publicKey != null
	})

  // initialized state
  useEffect(() => {
    if (open && positionInfo !== undefined) {
      const healthCoefficient = toNumber(positionInfo.tokenData.pools[poolIndex].assetInfo.healthScoreCoefficient);
      setAssetHealthCoefficient(healthCoefficient)
      setHealthScore(positionInfo.totalHealthScore)
      setMaxMintable(positionInfo.totalHealthScore / healthCoefficient)

      // @TODO
      setDefaultMintRatio(50)
      setDefaultMintAmount(0)
      setTotalLiquidity(50)
      setChangeAmount(0)
    }
  }, [open, positionInfo])

  const initData = () => {
    setValue('mintAmount', 0.0)
    onRefetchData()
  }

  const {
		handleSubmit,
		control,
    setValue,
		formState: { isDirty, errors },
		watch,
	} = useForm({
    mode: 'onChange',
    defaultValues: {
      mintAmount: 0.0,
    }
	})
  const [mintAmount] = watch([
		'mintAmount',
	])

  useEffect(() => {
    if (positionInfo !== undefined) {
      const mintAmount = maxMintable * mintRatio / 100
      setValue('mintAmount', mintAmount);
      setHealthScore(positionInfo.totalHealthScore - assetHealthCoefficient * mintAmount)
    }
  }, [mintRatio])

  const handleChangeMintRatio = useCallback((newRatio: number) => {
    setValue('mintAmount', maxMintable * newRatio / 100)
    setMintRatio(newRatio)
	}, [mintRatio, mintAmount])

  const handleChangeMintAmount = useCallback((mintAmount: number) => {
    setValue('mintAmount', mintAmount)
    setMintRatio( maxMintable > 0 ? mintAmount * 100 / maxMintable : 0)
	}, [mintRatio, mintAmount])

  const { mutateAsync } = useEditPositionMutation(publicKey)
  const onEditLiquidity = async () => {
    setLoading(true)
    // @TODO: implementing mutateAsync
    await mutateAsync({
      positionIndex: poolIndex,
      changeAmount,
      editType: 0
    },
    {
      onSuccess(data) {
        if (data) {
          console.log('data', data)
          enqueueSnackbar('Success to edit liquidity')
          refetch()
          initData()
        }
        setLoading(false)
      },
      onError(err) {
        console.error(err)
        enqueueSnackbar('Failed to edit liquidity')
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
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '5px 15px', overflow: 'hidden' }}>
          <Box sx={{ padding: '8px 18px', color: '#fff' }}>
            <Stack direction="row" justifyContent='space-between' alignItems='center'>
              <IconButton sx={{ color: '#fff' }} onClick={handleClose}><ChevronLeftIcon /></IconButton>
              <HeaderText>Edit Liquidity Position</HeaderText>
              <Box></Box>
            </Stack>
            <Divider />

            <Stack direction='row' gap={4}>
              <SelectedPoolBox positionInfo={positionInfo} />
              
              <Box sx={{ minWidth: '550px', padding: '8px 18px', color: '#fff' }}>
                <SelectLabel>Select amount of USDi & {positionInfo.tickerSymbol} to mint into {positionInfo.tickerSymbol} AMM</SelectLabel>
                <Box sx={{ marginTop: '15px' }}>
                  <EditLiquidityRatioSlider min={0} max={100} ratio={mintRatio} currentRatio={defaultMintRatio} positionInfo={positionInfo} totalLiquidity={totalLiquidity} mintAmount={mintAmount} currentMintAmount={defaultMintAmount} onChangeRatio={handleChangeMintRatio} onChangeAmount={handleChangeMintAmount} />
                </Box>

                <Divider />
                <Box>
                  <Box sx={{ fontSize: '12px', fontWeight: '600', color: '#acacac', marginLeft: '9px' }}>Projected Multipool Health Score <InfoTooltip title="Projected Multipool Health Score" /></Box>
                  <Box sx={{ fontSize: '20px', fontWeight: '500', textAlign: 'center' }}>{healthScore.toFixed(2)}/100</Box>
                </Box>
                <Divider />

                <EditPositionButton onClick={handleSubmit(onEditLiquidity)} disabled={!isValid}>Edit Liquidity Position</EditPositionButton>
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
  margin-top: 15px;
  margin-bottom: 10px;
  background-color: #2c2c2c;
`

const SelectLabel = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
`

const EditPositionButton = styled(Button)`
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

export default EditLiquidityDialog

