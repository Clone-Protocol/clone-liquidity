import React, { useState, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
// import { useIncept } from '~/hooks/useIncept'
import Image from 'next/image'
import WarningIcon from 'public/images/warning-icon.png'
import { Box, styled, Button, Stack, Dialog, DialogContent } from '@mui/material'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { useRecenterMutation } from '~/features/Comet/Comet.mutation'
// import { useBalanceQuery } from '~/features/Comet/Balance.query'
import { SliderTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import SelectedPoolBox from '~/components/Liquidity/multipool/SelectedPoolBox'

interface CometInfo {
  healthScore: number
  prevHealthScore: number
  currentCollateral: number
  usdiCost: number
  centerPrice: number
	lowerLimit: number
  upperLimit: number
}

const RecenterDialog = ({ assetId, open, handleClose }: { assetId: string, open: any, handleClose: any }) => {
  const { publicKey } = useWallet()
  // const { getInceptApp } = useIncept()
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
    lowerLimit: 0,
    upperLimit: 0
  })

  const cometIndex = parseInt(assetId)

  // const { data: usdiBalance, refetch } = useBalanceQuery({ 
  //   userPubKey: publicKey, 
  //   refetchOnMount: true,
  //   enabled: open && publicKey != null
  // });

  // useEffect(() => {
  //   if (usdiBalance && cometData) {
  //     console.log('d', usdiBalance.balanceVal +"/"+ Number(cometData.usdiCost) +"/"+ (usdiBalance.balanceVal < cometData.usdiCost) )
  //     setIsLackBalance(usdiBalance.balanceVal < cometData.usdiCost)
  //   }
  // }, [usdiBalance, cometData])

  // useEffect(() => {
  //   async function fetch() {
  //     if (open) {
  //       const program = getInceptApp()
  //       await program.loadManager()

  //       const comet = await program.getSinglePoolComets();
  //       const { 
  //         healthScore,
  //         usdiCost,
  //         lowerPrice,
  //         upperPrice
  //       } = await program.calculateCometRecenterSinglePool(cometIndex)
  //       const balances = await program.getPoolBalances(cometIndex)
  //       const prevHScore = await program.getSinglePoolHealthScore(cometIndex)
  //       const price = balances[1] / balances[0]
  //       setCometData({
  //         healthScore,
  //         prevHealthScore: prevHScore.healthScore,
  //         currentCollateral: toNumber(comet.collaterals[cometIndex].collateralAmount),
  //         usdiCost,
  //         centerPrice: price,
  //         lowerLimit: lowerPrice,
  //         upperLimit: upperPrice
  //       })
  //     }
  //   }
  //   fetch()
  // }, [open])
  

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
            enqueueSnackbar('Success to recenter')

            // refetch()
            handleClose()
            //hacky sync
            location.reload()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to recenter : No price deviation detected.')
          setLoading(false)
        }
      }
    )
  }

  return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Dialog open={open} onClose={handleClose} TransitionComponent={SliderTransition} maxWidth={960}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '25px 35px', overflow: 'hidden' }}>
          <HeaderText>Recenter</HeaderText>
          <Divider />
          <Stack direction='row' gap={4}>
            <SelectedPoolBox />

            <Box sx={{ minWidth: '550px', padding: '8px 18px', color: '#fff' }}>
              <Box sx={{ marginTop: '20px', marginBottom: '22px'}}>
                <Stack sx={{ borderTopRightRadius: '10px', borderTopLeftRadius: '10px', border: 'solid 1px #444', padding: '12px 24px 12px 27px' }} direction="row" justifyContent="space-between">
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#fff9f9', display: 'flex', alignItems: 'center'}}>Recentering Cost <InfoTooltip title="recenter cost" /></div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#fff'}}>
                    {cometData.usdiCost.toLocaleString()} USDi
                    <div style={{ fontSize: '10px', color: '#b9b9b9', textAlign: 'right'}}>${cometData.usdiCost.toLocaleString()}</div>
                  </div>
                </Stack>
                <BottomBox>
                  Total Collateral Value: <span style={{ color: '#fff' }}>${cometData.currentCollateral.toLocaleString()}</span>
                </BottomBox>
              </Box>

              <StyledDivider />

              <Stack direction="row" justifyContent="space-between" alignItems='center'>
                <SubTitle>Projected Health Score <InfoTooltip title="projected health score" /></SubTitle>
                <DetailValue>
                  {cometData.healthScore.toFixed(2)}/100 <span style={{ color: '#949494' }}>(prev. {cometData.prevHealthScore.toFixed(2)}/100)</span>
                </DetailValue>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems='center'>
                <SubTitle>Estimated Total Collateral After Recentering <InfoTooltip title="estimated collateral after recentering" /></SubTitle>
                <DetailValue>
                  {(cometData.currentCollateral - cometData.usdiCost).toLocaleString()} USDi <span style={{ color: '#949494' }}>(${(cometData.currentCollateral - cometData.usdiCost).toLocaleString()})</span>
                </DetailValue>
              </Stack>

              <StyledDivider />
              <ActionButton onClick={() => handleRecenter()} disabled={isLackBalance || parseInt(cometData.usdiCost.toLocaleString()) == 0}>Recenter</ActionButton>

              { isLackBalance && 
                <Stack
                  sx={{
                    background: 'rgba(233, 209, 0, 0.04)',
                    border: '1px solid #e9d100',
                    borderRadius: '10px',
                    color: '#9d9d9d',
                    padding: '8px',
                    marginTop: '17px',
                  }}
                  direction="row">
                  <Box sx={{ width: '53px', marginLeft: '20px', textAlign: 'center' }}>
                    <Image src={WarningIcon} />
                  </Box>
                  <NotEnoughBox>
                    Not enough wallet balance to pay for the cost.
                  </NotEnoughBox>
                </Stack>
              }
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
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
	margin-bottom: 10px;
	margin-top: 10px;
	height: 1px;
`

const SubTitle = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
`

const DetailValue = styled('div')`
	font-size: 11px;
	font-weight: 500;
	color: #fff;
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
  margin-top: 15px;
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