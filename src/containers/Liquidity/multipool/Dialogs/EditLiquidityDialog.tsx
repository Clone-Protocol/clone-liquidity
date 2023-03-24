import React, { useState, useCallback, useEffect } from 'react'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { Box, styled, Button, Stack, Dialog, DialogContent, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { SliderTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import SelectedPoolBox from '~/components/Liquidity/multipool/SelectedPoolBox'
import { useLiquidityDetailQuery } from '~/features/MyLiquidity/multipool/LiquidityPosition.query'
import { useEditPositionMutation } from '~/features/MyLiquidity/multipool/LiquidityPosition.mutation'
import { useForm } from 'react-hook-form'
import EditLiquidityRatioSlider from '~/components/Liquidity/multipool/EditLiquidityRatioSlider'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import { TooltipTexts } from '~/data/tooltipTexts'
import { StyledDivider } from '~/components/Common/StyledDivider'
import HealthscoreBar from '~/components/Overview/HealthscoreBar'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'

const EditLiquidityDialog = ({ open, positionIndex, poolIndex, onRefetchData, handleClose }: { open: boolean, positionIndex: number, poolIndex: number, onRefetchData: () => void, handleClose: () => void }) => {
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
  const [validMintAmount, setValidMintAmount] = useState(true)

  const { data: positionInfo, refetch } = useLiquidityDetailQuery({
    userPubKey: publicKey,
    index: poolIndex,
    refetchOnMount: true,
    enabled: open && publicKey != null,
  })

  // initialized state
  useEffect(() => {
    if (open && positionInfo !== undefined) {
      const position = positionInfo.comet!.positions[positionIndex]
      const healthCoefficient = toNumber(positionInfo.tokenData.pools[poolIndex].assetInfo.healthScoreCoefficient)
      const currentPosition = toNumber(position!.borrowedUsdi)

      setAssetHealthCoefficient(healthCoefficient)
      setHealthScore(positionInfo.totalHealthScore)
      const maxMintable = positionInfo.totalCollValue * positionInfo.totalHealthScore / healthCoefficient + currentPosition
      setMaxMintable(maxMintable)

      setDefaultMintRatio(100 * currentPosition / maxMintable)
      setDefaultMintAmount(currentPosition)
      setMintRatio(100 * currentPosition / maxMintable)
      setTotalLiquidity(currentPosition * 2)
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
      mintAmount: 0,
    }
  })
  const [mintAmount] = watch([
    'mintAmount',
  ])

  useEffect(() => {
    if (positionInfo !== undefined) {
      const mintAmount = maxMintable * mintRatio / 100
      setValue('mintAmount', mintAmount);
      setHealthScore(positionInfo.totalHealthScore - (assetHealthCoefficient * (mintAmount - defaultMintAmount)) / positionInfo.totalCollValue)
      setTotalLiquidity(mintAmount * 2);
      setValidMintAmount(mintAmount < maxMintable && mintRatio < 100 && mintAmount !== defaultMintAmount && mintRatio !== defaultMintRatio)
    }
  }, [mintRatio])

  const handleChangeMintRatio = useCallback((newRatio: number) => {
    setValue('mintAmount', maxMintable * newRatio / 100)
    setMintRatio(newRatio)
  }, [mintRatio, mintAmount])

  const handleChangeMintAmount = useCallback((mintAmount: number) => {
    setValue('mintAmount', mintAmount)
    setMintRatio(maxMintable > 0 ? mintAmount * 100 / maxMintable : 0)
  }, [mintRatio, mintAmount])

  const { mutateAsync } = useEditPositionMutation(publicKey)
  const onEditLiquidity = async () => {
    setLoading(true)
    await mutateAsync({
      positionIndex: positionIndex,
      changeAmount: Math.abs(mintAmount - defaultMintAmount),
      editType: mintAmount > defaultMintAmount ? 0 : 1
    },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Successfully modified liquidity position')
            refetch()
            initData()
            handleClose()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Error modifying liquidity position')
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
        <DialogContent sx={{ backgroundColor: '#1b1b1b' }}>
          <BoxWrapper>
            <Box mb='5px'>
              <Typography variant='p_xlg'>Manage Multipool Liquidity</Typography>
            </Box>
            <StyledDivider />

            <Stack direction='row' gap={4}>
              <Box>
                {/* <SelectedPoolBox positionInfo={positionInfo} /> */}

                <Typography variant='h8'>Adjust Liquidity to mint into USDi/{positionInfo.tickerSymbol} Pool</Typography>
                <Box mt='25px'>
                  <EditLiquidityRatioSlider min={0} max={100} ratio={mintRatio} currentRatio={defaultMintRatio} positionInfo={positionInfo} totalLiquidity={totalLiquidity} mintAmount={mintAmount} currentMintAmount={defaultMintAmount} maxMintable={maxMintable} onChangeRatio={handleChangeMintRatio} onChangeAmount={handleChangeMintAmount} />
                </Box>

                <BoxWithBorder mt='14px'>
                  <Stack direction='row' justifyContent='space-between' alignItems="center" padding='15px'>
                    <Typography variant='p'>New Aggregate Liquidity Value</Typography>
                    <Typography variant='p_xlg'>${totalLiquidity.toLocaleString()}</Typography>
                  </Stack>
                  <Box borderTop='1px solid #3f3f3f' padding='5px 7px' display='flex' justifyContent='center'>
                    <Typography variant='p' color='#989898'>Current Aggregate Liquidity Value: </Typography>
                    <Typography variant='p'>${positionInfo.totalCollValue.toLocaleString()} USD</Typography>
                  </Box>
                </BoxWithBorder>
              </Box>

              <RightBox>
                <Typography variant='h8'>Projected Values</Typography>
                <BoxWithBorder mt='13px' padding='6px 20px'>
                  <Box>
                    <Box><Typography variant='p'>Projected Healthscore <InfoTooltip title={TooltipTexts.projectedMultipoolEditHealthScore} /></Typography></Box>
                    <Box p='10px'><HealthscoreBar score={healthScore} prevScore={positionInfo.totalHealthScore} hideIndicator={true} width={430} /></Box>
                  </Box>
                </BoxWithBorder>

                <ActionButton onClick={handleSubmit(onEditLiquidity)} disabled={!(isValid && validMintAmount)}>Edit Liquidity Position</ActionButton>

                <Box display='flex' justifyContent='center'>
                  <DataLoadingIndicator />
                </Box>
              </RightBox>
            </Stack>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  ) : <></>
}

const BoxWrapper = styled(Box)`
  padding: 8px 18px; 
  color: #fff;
  overflow-x: hidden;
`
const BoxWithBorder = styled(Box)`
	border: solid 1px ${(props) => props.theme.boxes.blackShade};
`
const RightBox = styled(Box)`
  min-width: 550px; 
  padding: 8px 18px; 
  color: #fff;
`
const ActionButton = styled(Button)`
  width: 100%;
  background-color: ${(props) => props.theme.palette.primary.main};
  color: #000;
  border-radius: 0px;
  margin-top: 15px;
  margin-bottom: 15px;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: ${(props) => props.theme.boxes.grey};
    color: #000;
  }
`

export default EditLiquidityDialog

