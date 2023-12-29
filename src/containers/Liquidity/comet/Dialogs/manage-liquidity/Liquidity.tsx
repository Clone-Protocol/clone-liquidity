import React, { useState, useCallback, useEffect } from 'react'
import { Box, styled, Stack, Typography } from '@mui/material'
import { useWallet } from '@solana/wallet-adapter-react'
import IconHealthScoreGraph from 'public/images/healthscore-graph.svg'
import { SubmitButton } from '~/components/Common/CommonButtons'
import HealthscoreView, { RISK_HEALTH_SCORE } from '~/components/Liquidity/comet/HealthscoreView'
import EditLiquidityRatioSlider from '~/components/Liquidity/comet/EditLiquidityRatioSlider'
import { TooltipTexts } from '~/data/tooltipTexts'
import Image from 'next/image'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { PositionInfo } from '~/features/MyLiquidity/comet/LiquidityPosition.query'
import { useEditPositionMutation } from '~/features/MyLiquidity/comet/LiquidityPosition.mutation'
import { useForm } from 'react-hook-form'
import { fromScale } from 'clone-protocol-sdk/sdk/src/clone'
import WarningMsg, { InfoMsg } from '~/components/Common/WarningMsg'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { Status } from 'clone-protocol-sdk/sdk/generated/clone'

const Liquidity = ({ positionInfo, positionIndex, poolIndex, onRefetchData }: { positionInfo: PositionInfo, positionIndex: number, poolIndex: number, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const [defaultMintRatio, setDefaultMintRatio] = useState(0)
  const [defaultMintAmount, setDefaultMintAmount] = useState(0)
  const [mintRatio, setMintRatio] = useState(50)
  const [disableRatio, setDisableRatio] = useState(false)
  const [totalLiquidity, setTotalLiquidity] = useState(0)
  const [healthScore, setHealthScore] = useState(0)
  const [maxMintable, setMaxMintable] = useState(0)
  const [assetHealthCoefficient, setAssetHealthCoefficient] = useState(0)
  const [validMintAmount, setValidMintAmount] = useState(true)

  // initialized state
  useEffect(() => {
    if (positionInfo && positionInfo.comet) {
      const position = positionInfo.comet.positions[positionIndex]
      const healthCoefficient = fromScale(positionInfo.pools.pools[poolIndex].assetInfo.positionHealthScoreCoefficient, 2)
      const currentPosition = fromScale(position.committedCollateralLiquidity, 6)

      setAssetHealthCoefficient(healthCoefficient)
      setHealthScore(positionInfo.totalHealthScore)
      const maxMintable = positionInfo.effectiveCollateralValue * positionInfo.totalHealthScore / healthCoefficient + currentPosition
      setMaxMintable(maxMintable)

      setDefaultMintRatio(100 * currentPosition / maxMintable)
      setDefaultMintAmount(currentPosition)
      setTotalLiquidity(currentPosition * 2)

      if (positionInfo.status === Status.Extraction || positionInfo.status === Status.Liquidation) {
        setMintRatio(0)
        setDisableRatio(true)
      } else {
        setMintRatio(100 * currentPosition / maxMintable)
      }
    }
  }, [positionInfo])

  const initData = () => {
    setValue('mintAmount', 0.0)
    onRefetchData()
  }

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
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
    if (positionInfo) {
      const mintAmount = maxMintable * mintRatio / 100
      setHealthScore(positionInfo.totalHealthScore - (assetHealthCoefficient * (mintAmount - defaultMintAmount)) / positionInfo.effectiveCollateralValue)
      setTotalLiquidity(mintAmount * 2);
      setValidMintAmount(mintAmount < maxMintable && mintRatio < 100 && mintAmount !== defaultMintAmount && mintRatio !== defaultMintRatio)
    }
  }, [mintRatio])

  const handleChangeMintRatio = useCallback((newRatio: number) => {
    // MEMO: if newRatio is near from default ratio, then set newRatio to default ratio
    const convertNewRatio = Math.min(parseInt(newRatio.toString()) === defaultMintRatio ? defaultMintRatio : newRatio, 99)
    setValue('mintAmount', maxMintable * convertNewRatio / 100)
    setMintRatio(convertNewRatio)
  }, [mintRatio, mintAmount])

  // const handleChangeMintAmount = useCallback((mintAmount: number) => {
  //   setValue('mintAmount', mintAmount)
  //   setMintRatio(maxMintable > 0 ? mintAmount * 100 / maxMintable : 0)
  // }, [mintRatio, mintAmount])

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
        initData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const isValid = Object.keys(errors).length === 0 && validMintAmount && !isSubmitting
  const differentLiquidityVal = totalLiquidity - (defaultMintAmount * 2)
  const hasRiskScore = healthScore < RISK_HEALTH_SCORE

  return (
    <>
      <Box>
        <Typography variant='p_lg'>Liquidity Amount</Typography>
        <InfoTooltip title={TooltipTexts.liquidityAmount} color='#66707e' />
      </Box>
      <Box mt='20px'>
        <EditLiquidityRatioSlider min={0} max={100} ratio={mintRatio} currentRatio={defaultMintRatio} disableHandleRatio={disableRatio} onChangeRatio={handleChangeMintRatio} />
      </Box>

      <BoxWithBorder>
        <Stack direction='row' justifyContent='space-between' alignItems="center" padding='15px'>
          <Box>
            <Typography variant='p'>New Liquidity Value</Typography>
            <InfoTooltip title={TooltipTexts.newLiquidityValue} color='#66707e' />
          </Box>
          <Box>
            <Typography variant='p_lg'>${totalLiquidity.toLocaleString(undefined, { maximumFractionDigits: 5 })}</Typography>
            <Typography variant='p_lg' ml='9px' sx={differentLiquidityVal >= 0 ? { color: '#4fe5ff' } : { color: '#ff0084' }}>
              {differentLiquidityVal >= 0 ? '+' : '-'}${Math.abs(differentLiquidityVal).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </BoxWithBorder>

      <Box mt='38px'>
        {mintRatio > 0 ?
          <CometHealthBox padding='15px 20px'>
            <Box display='flex' justifyContent='center'>
              <Typography variant='p'>Projected Comet Health Score <InfoTooltip title={TooltipTexts.projectedHealthScore} color='#66707e' /></Typography>
            </Box>
            <Box mt='15px' display='flex' justifyContent='center'>
              <HealthscoreView score={healthScore ?? positionInfo.totalHealthScore} />
            </Box>
          </CometHealthBox>
          :
          <CometHealthBox padding='36px 20px' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            <Image src={IconHealthScoreGraph} alt='healthscore' />
            <Box mt='7px'>
              <Typography variant='p' color='#414e66'>Projected health score unavailable</Typography>
            </Box>
          </CometHealthBox>
        }

        <>
          {
            mintRatio == 0 ?
              <InfoMsg>
                With New Liquidity Value at $0.00, you will be withdrawing liquidity from this position. You can always return later to increase the liquidity amount of this position.
              </InfoMsg>
              :
              hasRiskScore ?
                <WarningMsg>
                  Due to low health score, you will have high possibility to become subject to liquidation. Click to learn more about our liquidation process.
                </WarningMsg>
                : <></>
          }
        </>

        <SubmitButton onClick={handleSubmit(onEditLiquidity)} disabled={!isValid} hasRisk={hasRiskScore}>
          <Typography variant='p_xlg'>{hasRiskScore && 'Accept Risk and '}Adjust Liquidity</Typography>
        </SubmitButton>
      </Box>
    </>
  )
}

const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`
const CometHealthBox = styled(Box)`
  background-color: ${(props) => props.theme.basis.darkNavy};
  margin-bottom: 30px;
`

export default withSuspense(Liquidity, <LoadingProgress />)