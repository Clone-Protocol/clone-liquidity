import React, { useState, useCallback, useEffect } from 'react'
import { Box, styled, Stack, Dialog, DialogContent, Typography } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import { FadeTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { useLiquidityDetailQuery } from '~/features/MyLiquidity/comet/LiquidityPosition.query'
import { useEditPositionMutation } from '~/features/MyLiquidity/comet/LiquidityPosition.mutation'
import { useForm } from 'react-hook-form'
import EditLiquidityRatioSlider from '~/components/Liquidity/comet/EditLiquidityRatioSlider'
import { toNumber } from 'clone-protocol-sdk/sdk/src/decimal'
import { TooltipTexts } from '~/data/tooltipTexts'
import { StyledDivider } from '~/components/Common/StyledDivider'
import HealthscoreBar from '~/components/Overview/HealthscoreBar'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { SubmitButton } from '~/components/Common/CommonButtons'

const EditLiquidityDialog = ({ open, positionIndex, poolIndex, onShowCloseLiquidity, onRefetchData, handleClose }: { open: boolean, positionIndex: number, poolIndex: number, onShowCloseLiquidity: () => void, onRefetchData: () => void, handleClose: () => void }) => {
  const { publicKey } = useWallet()
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
      const healthCoefficient = toNumber(positionInfo.tokenData.pools[poolIndex].assetInfo.positionHealthScoreCoefficient)
      const currentPosition = toNumber(position!.committedOnusdLiquidity)

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
    formState: { isDirty, errors, isSubmitting },
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
      // console.log('mintRatio', mintRatio)
      setValue('mintAmount', mintAmount);
      setHealthScore(positionInfo.totalHealthScore - (assetHealthCoefficient * (mintAmount - defaultMintAmount)) / positionInfo.totalCollValue)
      setTotalLiquidity(mintAmount * 2);
      setValidMintAmount(mintAmount < maxMintable && mintRatio < 100 && mintAmount !== defaultMintAmount && mintRatio !== defaultMintRatio)
    }
  }, [mintRatio])

  const handleChangeMintRatio = useCallback((newRatio: number) => {
    // console.log('newRatio', newRatio)
    // MEMO: if newRatio is near from default ratio, then set newRatio to default ratio
    const convertNewRatio = parseInt(newRatio.toString()) === defaultMintRatio ? defaultMintRatio : newRatio
    console.log('convertNewRatio', convertNewRatio)
    setValue('mintAmount', maxMintable * convertNewRatio / 100)
    setMintRatio(convertNewRatio)
  }, [mintRatio, mintAmount])

  const handleChangeMintAmount = useCallback((mintAmount: number) => {
    setValue('mintAmount', mintAmount)
    setMintRatio(maxMintable > 0 ? mintAmount * 100 / maxMintable : 0)
  }, [mintRatio, mintAmount])

  const { mutateAsync } = useEditPositionMutation(publicKey)
  const onEditLiquidity = async () => {
    try {
      const data = await mutateAsync({
        positionIndex: positionIndex,
        changeAmount: Math.abs(mintAmount - defaultMintAmount),
        editType: mintAmount > defaultMintAmount ? 0 : 1
      })

      if (data) {
        console.log('data', data)
        refetch()
        initData()
        handleClose()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const isValid = Object.keys(errors).length === 0

  return positionInfo ? (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={960}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b' }}>
          <BoxWrapper>
            <Box mb='5px'>
              <Typography variant='p_xlg'>Manage Comet Liquidity Position</Typography>
            </Box>
            <StyledDivider />

            <Stack direction='row' gap={4}>
              <Box>
                {/* <SelectedPoolBox positionInfo={positionInfo} /> */}

                <Typography variant='h8'>Adjust Liquidity to mint into onUSD/{positionInfo.tickerSymbol} Pool</Typography>
                <Box mt='25px'>
                  <EditLiquidityRatioSlider min={0} max={100} ratio={mintRatio} currentRatio={defaultMintRatio} positionInfo={positionInfo} totalLiquidity={totalLiquidity} mintAmount={mintAmount} currentMintAmount={defaultMintAmount} maxMintable={maxMintable} onChangeRatio={handleChangeMintRatio} onChangeAmount={handleChangeMintAmount} />
                </Box>

                {mintRatio > 0 ?
                  <BoxWithBorder>
                    <Stack direction='row' justifyContent='space-between' alignItems="center" padding='15px'>
                      <Typography variant='p'>Your New Liquidity Value</Typography>
                      <Typography variant='p_xlg'>${totalLiquidity.toLocaleString()}</Typography>
                    </Stack>
                    <Box borderTop='1px solid #3f3f3f' padding='5px 7px' display='flex' justifyContent='center'>
                      <Typography variant='p' color='#989898'>Your Current Liquidity Value: </Typography>
                      <Typography variant='p' ml='5px'>${(defaultMintAmount * 2).toLocaleString()} USD</Typography>
                    </Box>
                  </BoxWithBorder>
                  :
                  <Box>
                    <BoxWithBorder padding='15px 18px' maxWidth='420px' lineHeight={1}>
                      <Typography variant='p'>Liquidity shouldn’t be at 0%. If you would like to close this position, please click on the button below.</Typography>
                    </BoxWithBorder>
                    <SubmitButton onClick={onShowCloseLiquidity}>Open Close Liquidity Position Workflow</SubmitButton>
                  </Box>
                }
              </Box>

              <RightBox>
                <Typography variant='h8'>Projected Values</Typography>
                {mintRatio > 0 ?
                  <BoxWithBorder mt='7px' padding='6px 20px 0px 20px'>
                    <Box>
                      <Box><Typography variant='p'>Projected Healthscore <InfoTooltip title={TooltipTexts.projectedEditHealthScore} /></Typography></Box>
                      <Box py='10px'><HealthscoreBar score={healthScore} prevScore={positionInfo.totalHealthScore} hideIndicator={true} width={430} /></Box>
                    </Box>
                  </BoxWithBorder>
                  :
                  <BoxWithBorder mt='10px' minHeight='155px' display='flex' justifyContent='center' alignItems='center'>
                    <Box width='100%' display='flex' justifyContent='center'><Typography variant='p'>N/A</Typography></Box>
                  </BoxWithBorder>
                }

                <SubmitButton onClick={handleSubmit(onEditLiquidity)} disabled={!(isValid && validMintAmount) || isSubmitting || mintRatio === 0}>Edit Liquidity Position</SubmitButton>

                <Box display='flex' justifyContent='center'>
                  <DataLoadingIndicator onRefresh={() => refetch()} />
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

export default EditLiquidityDialog

