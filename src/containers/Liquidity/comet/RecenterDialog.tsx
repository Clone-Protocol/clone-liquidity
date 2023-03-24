import React, { useState, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { useIncept } from '~/hooks/useIncept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import Image from 'next/image'
import { Box, styled, Button, Stack, Dialog, DialogContent, Typography } from '@mui/material'
import EditConcentrationRangeBox from '~/components/Liquidity/comet/EditConcentrationRangeBox'
import HealthscoreBar from '~/components/Overview/HealthscoreBar'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import TipMsg from '~/components/Common/TipMsg'
import InfoIcon from 'public/images/info-icon.svg'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { useRecenterMutation } from '~/features/Comet/Comet.mutation'
import { useCometDetailQuery } from '~/features/MyLiquidity/CometPosition.query'
import { useBalanceQuery } from '~/features/Comet/Balance.query'
import { SliderTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { getSinglePoolHealthScore, calculateCometRecenterSinglePool } from 'incept-protocol-sdk/sdk/src/healthscore'

interface CometInfo {
  healthScore: number
  prevHealthScore: number
  currentCollateral: number
  usdiCost: number
  centerPrice: number
  poolPrice: number
  lowerLimit: number
  upperLimit: number
}

const RecenterDialog = ({ assetId, open, onRefetchData, handleClose }: { assetId: string, open: boolean, onRefetchData?: () => void, handleClose: () => void }) => {
  const { publicKey } = useWallet()
  const wallet = useAnchorWallet()
  const { getInceptApp } = useIncept()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const { mutateAsync } = useRecenterMutation(publicKey)
  const [isLackBalance, setIsLackBalance] = useState(false)
  const [cometData, setCometData] = useState<CometInfo>({
    healthScore: 0,
    prevHealthScore: 0,
    currentCollateral: 0,
    usdiCost: 0,
    centerPrice: 0,
    poolPrice: 0,
    lowerLimit: 0,
    upperLimit: 0
  })

  const cometIndex = parseInt(assetId)

  const { data: cometDetail } = useCometDetailQuery({
    userPubKey: publicKey,
    index: cometIndex,
    refetchOnMount: true,
    enabled: publicKey != null
  })

  const { data: usdiBalance, refetch } = useBalanceQuery({
    userPubKey: publicKey,
    refetchOnMount: true,
    enabled: open && publicKey != null
  });

  useEffect(() => {
    if (usdiBalance && cometData) {
      setIsLackBalance(usdiBalance.balanceVal <= cometData.usdiCost)
    }
  }, [usdiBalance, cometData])

  useEffect(() => {
    async function fetch() {
      if (open && wallet && cometDetail) {
        const program = getInceptApp(wallet)
        await program.loadManager()
        const [tokenDataResult, singlePoolCometResult] = await Promise.allSettled([
          program.getTokenData(), program.getSinglePoolComets()
        ]);
        if (tokenDataResult.status !== "fulfilled" || singlePoolCometResult.status !== "fulfilled") return;

        const {
          healthScore,
          usdiCost,
          lowerPrice,
          upperPrice
        } = calculateCometRecenterSinglePool(cometIndex, tokenDataResult.value, singlePoolCometResult.value)
        const pool = tokenDataResult.value.pools[singlePoolCometResult.value.positions[cometIndex].poolIndex];
        const balances = [toNumber(pool.iassetAmount), toNumber(pool.usdiAmount)];
        const prevHScore = getSinglePoolHealthScore(cometIndex, tokenDataResult.value, singlePoolCometResult.value)
        const price = balances[1] / balances[0]
        setCometData({
          healthScore,
          prevHealthScore: prevHScore.healthScore,
          currentCollateral: toNumber(singlePoolCometResult.value.collaterals[cometIndex].collateralAmount),
          usdiCost,
          centerPrice: cometDetail.centerPrice,
          poolPrice: price,
          lowerLimit: Math.min(lowerPrice, cometDetail.centerPrice),
          upperLimit: Math.max(upperPrice, cometDetail.centerPrice)
        })
      }
    }
    fetch()
  }, [open, wallet, cometDetail])

  const handleRecenter = async () => {
    setLoading(true)
    await mutateAsync(
      {
        cometIndex
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Successfully recentered position')

            refetch()
            onRefetchData && onRefetchData()
            handleClose()
            //hacky sync
            location.reload()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to recenter position : No price deviation detected.')
          setLoading(false)
        }
      }
    )
  }

  const isValidToRecenter = () => {
    if (cometData.centerPrice === 0 || cometData.poolPrice === 0)
      return false

    return cometData.usdiCost > 0 && Math.abs(cometData.centerPrice - cometData.poolPrice) / cometData.centerPrice >= 0.001
  }

  return (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}

      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={480}>
        <DialogContent sx={{ background: '#1b1b1b' }}>
          <BoxWrapper>
            <Box mb='16px'><Typography variant='p_xlg'>Recenter Comet Position</Typography></Box>
            <TipMsg>
              <Image src={InfoIcon} /> <Typography variant='p' ml='10px' maxWidth='340px' textAlign='left' lineHeight='13px' sx={{ cursor: 'pointer' }}>Recentering is an important function of Comet. Click here to learn more about how recentering works.</Typography>
            </TipMsg>
            <Box marginTop='20px' marginBottom='22px'>
              {/* <WalletBalance>
                Wallet balance: <span style={isLackBalance ? { color: '#e9d100', marginLeft: '4px' } : { marginLeft: '4px' }}>{usdiBalance?.balanceVal.toLocaleString()} USDi</span>
              </WalletBalance> */}
              <CenterBox>
                <Stack direction="row" justifyContent="space-between">
                  <Box><Typography variant='p'>Recentering Cost</Typography> <InfoTooltip title={TooltipTexts.recenteringCost} /></Box>
                  <Box>
                    <Typography variant='p_xlg'>{Math.max(0, cometData.usdiCost).toLocaleString()} USDi</Typography>
                  </Box>
                </Stack>
              </CenterBox>
              <BottomBox>
                <Typography variant='p' color='#989898'>Current Collateral: </Typography> <Typography variant='p'>{cometData.currentCollateral.toLocaleString()} USDi (${cometData.currentCollateral.toLocaleString()})</Typography>
              </BottomBox>
            </Box>

            <BoxWithBorder mt='13px' padding='21px 24px'>
              <Box>
                <Box><Typography variant='p'>Projected Liquidity Concentration Range</Typography> <InfoTooltip title={TooltipTexts.projectedLiquidityConcRange} /></Box>
                <EditConcentrationRangeBox assetData={cometDetail} cometData={cometData} currentLowerLimit={cometData.lowerLimit} currentUpperLimit={cometData.upperLimit} />
              </Box>
              <Box my='20px'>
                <Box><Typography variant='p'>Projected Healthscore</Typography> <InfoTooltip title={TooltipTexts.projectedHealthScore} /></Box>
                <HealthscoreBar score={cometData.healthScore} prevScore={cometData.prevHealthScore} hideIndicator={true} width={490} />
              </Box>

              <Stack direction="row" justifyContent="space-between">
                <Box maxWidth='130px' lineHeight='14px'><Typography variant='p'>Estimated Collateral After Recentering</Typography></Box>
                <Box lineHeight='14px' textAlign='right'>
                  <Box><Typography variant='p_lg'>{(cometData.currentCollateral - cometData.usdiCost).toLocaleString()} USDi</Typography></Box>
                  <Box><Typography variant='p' color='#989898'>${(cometData.currentCollateral - cometData.usdiCost).toLocaleString()} USD</Typography></Box>
                </Box>
              </Stack>
            </BoxWithBorder>

            <ActionButton onClick={() => handleRecenter()} disabled={isLackBalance || !isValidToRecenter()}>
              <Typography variant='p_lg'>Recenter Now</Typography>
            </ActionButton>

            <Box display='flex' justifyContent='center'>
              <DataLoadingIndicator />
            </Box>

            {/* {isLackBalance &&
              <WarningStack direction="row">
                <WarningIconBox>
                  <Image src={WarningIcon} />
                </WarningIconBox>
                <NotEnoughBox>
                  Not enough wallet balance to pay for the cost.
                </NotEnoughBox>
              </WarningStack>
            } */}
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}

const BoxWrapper = styled(Box)`
  width: 480px;
  color: #fff;
  overflow-x: hidden;
`
const CenterBox = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  padding: 18px 15px;
`
const BottomBox = styled(Box)`
  text-align: center;
  height: 30px;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`
const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`
const ActionButton = styled(Button)`
  width: 100%;
  background-color: ${(props) => props.theme.palette.primary.main};
  color: #000;
  border-radius: 0px;
  margin-top: 16px;
  margin-bottom: 15px;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: ${(props) => props.theme.boxes.grey};
    color: #000;
  }
`

export default RecenterDialog