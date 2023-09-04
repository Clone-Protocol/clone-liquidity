import React, { useState, useEffect } from 'react'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { useWallet } from '@solana/wallet-adapter-react'
import { Box, Stack, FormHelperText, Typography, Button } from '@mui/material'
import { useForm } from 'react-hook-form'
import { styled } from '@mui/system'
import RatioSlider from '~/components/Asset/RatioSlider'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import HealthscoreBar from '~/components/Overview/HealthscoreBar'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useLiquidityDetailQuery } from '~/features/MyLiquidity/comet/LiquidityPosition.query'
import { useNewPositionMutation } from '~/features/MyLiquidity/comet/LiquidityPosition.mutation'
import { useRouter } from 'next/navigation'
import { toNumber } from 'clone-protocol-sdk/sdk/src/decimal'
import CometBlank from '~/components/Overview/CometBlank'
import DataPlusIcon from 'public/images/database-plus.svg'
import DataPlusHoverIcon from 'public/images/database-plus-on.svg'
import AirballoonIcon from 'public/images/airballoon-outline.svg'
import AirballoonHoverIcon from 'public/images/airballoon-outline-on.svg'
import { ConnectButton, SubmitButton } from '~/components/Common/CommonButtons'
import { OpaqueConnectWallet } from '~/components/Overview/OpaqueArea'

const RISK_SCORE_VAL = 20

const CometPanel = ({ assetIndex, children, onRefetchData }: { assetIndex: number, children: React.ReactNode, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const router = useRouter()
  const [mintRatio, setMintRatio] = useState(0)
  const [maxMintable, setMaxMintable] = useState(0.0)
  const [totalLiquidity, setTotalLiquidity] = useState(0)
  const [healthScore, setHealthScore] = useState(0)
  const [assetHealthCoefficient, setAssetHealthCoefficient] = useState(0)
  const [validMintValue, setValidMintValue] = useState(false)
  // const [openChooseCollateral, setOpenChooseCollateral] = useState(false)
  // const ChooseCollateralDialog = dynamic(() => import('./Dialogs/ChooseCollateralDialog'))

  const { data: positionInfo, refetch } = useLiquidityDetailQuery({
    userPubKey: publicKey,
    index: assetIndex,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  useEffect(() => {
    if (positionInfo) {
      const healthCoefficient = toNumber(positionInfo.tokenData.pools[assetIndex].assetInfo.positionHealthScoreCoefficient);
      setAssetHealthCoefficient(healthCoefficient)
      setHealthScore(positionInfo.totalHealthScore)
      setMaxMintable(positionInfo.totalCollValue * positionInfo.totalHealthScore / healthCoefficient)
      initData()
    }
  }, [positionInfo])

  const initData = () => {
    setMintRatio(0)
    onRefetchData()
  }

  const {
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { isDirty, errors, isSubmitting },
    watch,
    clearErrors
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

  // const validateMintAmount = () => {
  //   if (!isDirty) {
  //     clearErrors('mintAmount')
  //     return
  //   }

  //   if (!mintAmount || mintAmount <= 0) {
  //     return 'Mint amount should be above zero'
  //   } else if (mintAmount >= maxMintable) {
  //     return 'Mint amount cannot exceed the max mintable amount'
  //   }
  // }

  useEffect(() => {
    if (positionInfo) {
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
    try {
      const data = await mutateAsync({
        poolIndex: assetIndex,
        changeAmount: mintAmount,
      })

      if (data) {
        console.log('data', data)
        refetch()
        initData()
        router.push('/myliquidity')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const isValid = Object.keys(errors).length === 0
  const hasRiskScore = healthScore < RISK_SCORE_VAL

  const BlankNoCollateral = () => (
    <CometBlank title='Deposit collateral to your comet to get started' subtitle='Comets are designed to allow users to leverage the full capabilities of the CLS' icon={DataPlusIcon} hoverIcon={DataPlusHoverIcon} />
  )

  const BlankAlreadyPool = () => (
    <CometBlank title='Liquidity position for this pool already exists for Comet' subtitle='Please edit the liquidity for this pool in My Liquidity or select a different pool' icon={AirballoonIcon} hoverIcon={AirballoonHoverIcon} />
  )

  if (positionInfo?.hasNoCollateral) {
    return <BlankNoCollateral />
  } else if (positionInfo?.hasAlreadyPool) {
    return <BlankAlreadyPool />
  }

  return (
    <>
      <Box position='relative' mb='10px'>
        <Box>
          <BoxWithBorder p='14px 22px'>
            <Box>
              <Typography variant='p_lg'>Current Comet Status</Typography>
            </Box>
            <Box my='15px'>
              <SubHeader><Typography variant='p'>Collateral Value</Typography> <InfoTooltip title={TooltipTexts.totalCollateralValue} /></SubHeader>
              <Box><Typography variant='h3' fontWeight={500}>${positionInfo?.totalCollValue.toLocaleString()}</Typography></Box>
            </Box>
            <Box>
              <SubHeader><Typography variant='p'>Health Score</Typography> <InfoTooltip title={TooltipTexts.healthScoreCol} /></SubHeader>
              <HealthscoreBar score={positionInfo?.totalHealthScore} width={480} hiddenThumbTitle={true} />
            </Box>
          </BoxWithBorder>

          <BoxWithBorder padding="15px 24px" mt='24px'>
            {children}

            <Box>
              <Box>
                <Typography variant='p_lg'>Liquidity Amount</Typography>
              </Box>
              <Box mt='15px' mb='10px' p='5px'>
                <RatioSlider min={0} max={100} value={mintRatio} hideValueBox onChange={handleChangeMintRatio} />
              </Box>
              <FormHelperText error={!!errors.mintAmount?.message}>{errors.mintAmount?.message}</FormHelperText>
            </Box>

            <StackWithBorder direction='row' justifyContent='space-between' alignItems='center'>
              <Box display='flex' alignItems='center'><Typography variant="p">Liquidity Value</Typography></Box>
              <Box display='flex' alignItems='center'><Typography variant="p_lg">${totalLiquidity.toLocaleString()}</Typography></Box>
            </StackWithBorder>

            <Box mt='25px'>
              <Box mb="15px"><Typography variant="p_lg">Projected Health Score</Typography> <InfoTooltip title={TooltipTexts.healthScoreCol} color='#66707e' /></Box>
              <HealthscoreBar score={healthScore} width={470} hasRiskScore={hasRiskScore} hiddenThumbTitle={true} />
              {hasRiskScore &&
                <WarningStack direction='row'>
                  <WarningAmberIcon sx={{ color: '#ff0084', width: '15px' }} />
                  <Typography variant='p' ml='8px'>Due to low health score, you will have high possibility to become subject to liquidation. Click to learn more about our liquidation process.</Typography>
                </WarningStack>
              }
            </Box>
          </BoxWithBorder>
        </Box>

        {!publicKey && <OpaqueConnectWallet />}
      </Box>

      {!publicKey ?
        <ConnectButton>Connect Button</ConnectButton>
        :
        <SubmitButton onClick={handleSubmit(onNewLiquidity)} disabled={!(isValid && validMintValue) || isSubmitting} sx={hasRiskScore ? { backgroundColor: '#ff0084' } : {}}>
          <Typography variant='p_lg'>{hasRiskScore && 'Accept Risk and '} Open New Comet Liquidity Position</Typography>
        </SubmitButton>
      }
    </>
  )
}

const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`
const StackWithBorder = styled(Stack)`
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
  padding: 18px;
`
const WarningStack = styled(Stack)`
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  padding: 13px;
  border-radius: 5px;
  background-color: rgba(255, 0, 214, 0.15);
  color: #ff0084;
`
const SubHeader = styled(Box)`
  color: ${(props) => props.theme.basis.slug};
`

export default withSuspense(CometPanel, <LoadingProgress />)