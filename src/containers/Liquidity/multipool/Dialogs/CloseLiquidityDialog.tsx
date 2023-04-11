import React, { useState } from 'react'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { Box, styled, Button, Stack, Dialog, DialogContent, Typography } from '@mui/material'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { useRecenterInfoQuery } from '~/features/MyLiquidity/multipool/RecenterInfo.query'
import { useRecenterMutation } from '~/features/MyLiquidity/multipool/Recenter.mutation'
import { FadeTransition } from '~/components/Common/Dialog'
import InfoTooltip from '~/components/Common/InfoTooltip'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { TooltipTexts } from '~/data/tooltipTexts'
import Image from 'next/image'
import HealthscoreBar from '~/components/Overview/HealthscoreBar'
import { SubmitButton } from '~/components/Common/CommonButtons'

const CloseLiquidityDialog = ({
  positionIndex,
  poolIndex,
  open,
  onRefetchData,
  handleClose,
}: {
  positionIndex: number
  poolIndex: number
  open: boolean
  onRefetchData: () => void
  handleClose: () => void
}) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)

  const { data: positionInfo, refetch } = useRecenterInfoQuery({
    userPubKey: publicKey,
    index: positionIndex,
    refetchOnMount: true,
    enabled: open && publicKey != null,
  })

  const { mutateAsync } = useRecenterMutation(publicKey)
  const handleRecenter = async () => {
    // setLoading(true)
    await mutateAsync(
      {
        positionIndex
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            // enqueueSnackbar('Successfully recentered the position')

            refetch()
            onRefetchData()
            handleClose()
          }
          // setLoading(false)
        },
        onError(err) {
          console.error(err)
          // enqueueSnackbar('Failed to recenter position : No price deviation detected.')
          // setLoading(false)
        }
      }
    )
  }

  const displayILDDebt = () => {
    return Math.max(0, positionInfo!.recenterCost).toLocaleString()
  }

  return positionInfo ? (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}

      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={480}>
        <DialogContent sx={{ background: '#1b1b1b' }}>
          <BoxWrapper>
            <Box mb='16px'><Typography variant='p_xlg'>Close Multipool Liquidity Position</Typography></Box>
            <BoxWithBorder width='261px' p='9px'>
              <Stack direction='row' gap={1}>
                <Image src={positionInfo.tickerIcon} width="27px" height="27px" />
                <Box>
                  <Typography variant='p_xlg'>{positionInfo.tickerSymbol} {'<>'} USDi</Typography>
                </Box>
              </Stack>
            </BoxWithBorder>

            <Box marginTop='20px' marginBottom='22px'>
              <Box display='flex' justifyContent='flex-end'>
                <Typography variant='p' color='#989898'>Wallet Balance: </Typography>
                <Typography variant='p' ml='5px'>{positionInfo.usdiVal.toLocaleString(undefined, { maximumFractionDigits: 5 })}</Typography>
              </Box>
              <CenterBox>
                <Stack direction="row" justifyContent="space-between">
                  <Box><Typography variant='p'>ILD Debt</Typography> <InfoTooltip title={TooltipTexts.recenteringCost} /></Box>
                  <Box lineHeight={0.95}>
                    <Box><Typography variant='p_xlg'>{displayILDDebt()} {positionInfo.tickerSymbol}</Typography></Box>
                    <Box textAlign='right'><Typography variant='p' color='#989898'>${positionInfo.recenterCostDollarPrice.toLocaleString()}</Typography></Box>
                  </Box>
                </Stack>
              </CenterBox>
            </Box>

            <BoxWithBorder mt='13px' padding='15px'>
              <Box>
                <Box><Typography variant='p'>Projected Healthscore</Typography> <InfoTooltip title={TooltipTexts.projectedMultipoolHealthScoreRecentering} /></Box>
                <HealthscoreBar score={positionInfo.healthScore} prevScore={positionInfo.prevHealthScore} hideIndicator={true} width={440} />
              </Box>
            </BoxWithBorder>

            <SubmitButton onClick={() => handleRecenter()} disabled={!positionInfo.isValidToRecenter}>
              Pay ILD & Close Liquidity Position
            </SubmitButton>

            <Box display='flex' justifyContent='center'>
              <DataLoadingIndicator />
            </Box>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  ) : (
    <></>
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

export default CloseLiquidityDialog
