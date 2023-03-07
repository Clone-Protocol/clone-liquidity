import React, { useState, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { useIncept } from '~/hooks/useIncept'
import { toNumber } from 'incept-protocol-sdk/sdk/src/decimal'
import Image from 'next/image'
import WarningIcon from 'public/images/warning-icon.png'
import { Box, Divider, styled, Button, Stack, Dialog, DialogContent } from '@mui/material'
import ConcentrationRangeView from '~/components/Liquidity/comet/ConcentrationRangeView'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { useRecenterMutation } from '~/features/Comet/Comet.mutation'
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

const RecenterDialog = ({ assetId, centerPrice, open, handleClose }: { assetId: string, centerPrice: number, open: boolean, handleClose: () => void }) => {
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
      if (open && wallet) {
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
          centerPrice: centerPrice,
          poolPrice: price,
          lowerLimit: Math.min(lowerPrice, centerPrice),
          upperLimit: Math.max(upperPrice, centerPrice)
        })
      }
    }
    fetch()
  }, [open, wallet])
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

    return (
      cometData.usdiCost > 0 &&
      Math.abs(cometData.centerPrice - cometData.poolPrice) / cometData.centerPrice >= 0.001
    )
  }

  const recenterCostDisplay = () => {
    return Math.max(0, cometData.usdiCost).toLocaleString()
  }

  return (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}

      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '20px 15px', overflow: 'hidden' }}>
          <BoxWrapper>
            <WarningBox>
              If this is your first interaction with Recentering, please click here to learn.
            </WarningBox>
            <Box marginTop='20px' marginBottom='22px'>
              <WalletBalance>
                Wallet balance: <span style={isLackBalance ? { color: '#e9d100', marginLeft: '4px' } : { marginLeft: '4px' }}>{usdiBalance?.balanceVal.toLocaleString()} USDi</span>
              </WalletBalance>
              <TopStack direction="row" justifyContent="space-between">
                <StackTitle>Recentering cost <InfoTooltip title={TooltipTexts.recenteringCost} /></StackTitle>
                <StackValue>
                  {recenterCostDisplay()} USDi
                  <StackSubValue>${recenterCostDisplay()}</StackSubValue>
                </StackValue>
              </TopStack>
              <BottomBox>
                Current Collateral: <span style={{ color: '#fff' }}>{cometData.currentCollateral.toLocaleString()} USDi (${cometData.currentCollateral.toLocaleString()})</span>
              </BottomBox>
            </Box>

            <StyledDivider />

            <SubTitle>Projected Price Range <InfoTooltip title={TooltipTexts.projectedPriceRange} /></SubTitle>
            <RangeWrapper>
              <ConcentrationRangeView
                centerPrice={cometData.centerPrice}
                lowerLimit={cometData.lowerLimit}
                upperLimit={cometData.upperLimit}
                max={cometData.upperLimit}
              />
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Center price:</DetailHeader>
                <DetailValue>{cometData.centerPrice.toLocaleString()} USD</DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Lower limit:</DetailHeader>
                <DetailValue>{cometData.lowerLimit.toLocaleString()} USD</DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Upper limit:</DetailHeader>
                <DetailValue>{cometData.upperLimit.toLocaleString()} USD</DetailValue>
              </Stack>
            </RangeWrapper>
            <Stack direction="row" justifyContent="space-between">
              <SubTitle>Projected Health Score <InfoTooltip title={TooltipTexts.projectedHealthScore} /></SubTitle>
              <DetailValue>
                {cometData.healthScore.toFixed(2)}/100 <span style={{ color: '#949494' }}>(prev. {cometData.prevHealthScore.toFixed(2)}/100)</span>
              </DetailValue>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <SubTitle>Estimated Collateral After Recentering</SubTitle>
              <DetailValue>
                {(cometData.currentCollateral - cometData.usdiCost).toLocaleString()} USDi <span style={{ color: '#949494' }}>(${(cometData.currentCollateral - cometData.usdiCost).toLocaleString()})</span>
              </DetailValue>
            </Stack>

            <StyledDivider />
            <ActionButton onClick={() => handleRecenter()} disabled={isLackBalance || !isValidToRecenter()}>Recenter</ActionButton>

            {isLackBalance &&
              <WarningStack direction="row">
                <WarningIconBox>
                  <Image src={WarningIcon} />
                </WarningIconBox>
                <NotEnoughBox>
                  Not enough wallet balance to pay for the cost.
                </NotEnoughBox>
              </WarningStack>
            }
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}

const BoxWrapper = styled(Box)`
  padding: 8px 18px; 
  color: #fff;
  overflow-x: hidden;
`
const WarningStack = styled(Stack)`
  background: rgba(233, 209, 0, 0.04);
  border: 1px solid #e9d100;
  border-radius: 10px;
  color: #9d9d9d;
  padding: 8px;
  margin-top: 17px;
`
const WarningIconBox = styled(Box)`
  width: 53px; 
  margin-left: 20px; 
  text-align: center;
`
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
  padding-left: 40px;
  padding-right: 40px;
`
const TopStack = styled(Stack)`
  border-top-right-radius: 10px; 
  border-top-left-radius: 10px; 
  border: solid 1px #444; 
  padding: 12px 24px 12px 27px;
`
const StackTitle = styled('div')`
  font-size: 11px; 
  font-weight: 600; 
  color: #fff9f9; 
  display: flex; 
  align-items: center;
`
const StackValue = styled('div')`
  font-size: 16px; 
  font-weight: 500; 
  color: #fff;
`
const StackSubValue = styled('div')`
  font-size: 10px; 
  color: #b9b9b9; 
  text-align: right;
`
const BottomBox = styled(Box)`
  background: #252627;
  font-size: 11px;
  font-weight: 500;
  color: #949494;
  text-align: center;
  height: 28px;
  padding-top: 6px;
  border-bottom: solid 1px #444;
  border-left: solid 1px #444;
  border-right: solid 1px #444;
  border-bottom-left-radius: 9px;
  border-bottom-right-radius: 9px;
`
const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 15px;
	margin-top: 15px;
	height: 1px;
`
const SubTitle = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
  margin-bottom: 5px;
`
const DetailHeader = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
`
const DetailValue = styled('div')`
	font-size: 11px;
	font-weight: 500;
	color: #fff;
`
const WalletBalance = styled(Box)`
  display: flex;
  justify-content: right;
  color: #949494; 
  font-size: 12px;
  font-weight: 500; 
  margin-right: 10px;
  margin-bottom: 4px;
`
const RangeWrapper = styled(Box)`
  margin: 0 auto; 
  margin-top: 20px; 
  margin-bottom: 33px; 
  width: 345px;
`
const ActionButton = styled(Button)`
	width: 100%;
	height: 45px;
  flex-grow: 0;
  border-radius: 10px;
  background-color: #4e609f;
  font-size: 13px;
  font-weight: 600;
	color: #fff;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

const NotEnoughBox = styled(Box)`
	max-width: 500px;
  padding-left: 36px;
  padding-top: 4px;
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
`

export default RecenterDialog