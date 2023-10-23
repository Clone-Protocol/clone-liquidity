//@DEPRECATED
import React, { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Box, styled, Stack, Dialog, DialogContent, Typography } from "@mui/material"
import { FadeTransition } from "~/components/Common/Dialog"
import InfoTooltip from "~/components/Common/InfoTooltip"
import DataLoadingIndicator from "~/components/Common/DataLoadingIndicator"
import { TooltipTexts } from "~/data/tooltipTexts"
import Image from "next/image"
import HealthscoreBar from "~/components/Overview/HealthscoreBar"
import { SubmitButton } from "~/components/Common/CommonButtons"
import { useLiquidityPositionQuery } from "~/features/MyLiquidity/comet/LiquidityPosition.query"
import { useClosePositionMutation } from "~/features/MyLiquidity/comet/LiquidityPosition.mutation"

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: positionInfo, refetch } = useLiquidityPositionQuery({
    userPubKey: publicKey,
    index: positionIndex,
    refetchOnMount: "always",
    enabled: open && publicKey != null,
  })

  const { mutateAsync } = useClosePositionMutation(publicKey)
  const handleClosePosition = async () => {
    try {
      setIsSubmitting(true)
      const data = await mutateAsync({
        positionIndex,
        collateralBalance: positionInfo?.onusdVal!,
        collateralILD: positionInfo?.collateralILD!,
        onassetBalance: positionInfo?.onassetVal!,
        onassetILD: positionInfo?.onassetILD!,
        onassetMint: positionInfo?.onassetMint!,
        committedCollateralLiquidity: positionInfo?.committedCollateralLiquidity!,
      })

      if (data) {
        console.log("data", data)
        refetch()
        onRefetchData()
        handleClose()

        // hacky sync
        location.reload()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayILDDebt = () => {
    let components = []
    if (positionInfo!.collateralILD > 0) {
      components.push(
        `${Math.max(0, positionInfo!.collateralILD).toLocaleString(undefined, {
          maximumFractionDigits: 8,
        })} devUSD`
      )
    }
    if (positionInfo!.onassetILD > 0) {
      components.push(
        `${Math.max(0, positionInfo!.onassetILD).toLocaleString(undefined, {
          maximumFractionDigits: 8,
        })} ${positionInfo!.tickerSymbol}`
      )
    }

    if (components.length === 0)
      return "0 devUSD"

    return components.join(' + ')
  }

  const displayILDNotional = () => {
    let reward = 0
    if (positionInfo!.collateralILD > 0)
      reward += positionInfo!.collateralILD
    if (positionInfo!.onassetILD > 0)
      reward += positionInfo!.onassetILD * positionInfo!.price

    return `${Math.max(0, reward).toLocaleString(undefined, { maximumFractionDigits: 8 })} USD`
  }

  const displayReward = () => {
    let components = []
    if (positionInfo!.collateralILD < 0) {
      components.push(
        `${Math.max(0, -positionInfo!.collateralILD).toLocaleString(undefined, {
          maximumFractionDigits: 8,
        })} devUSD`
      )
    }
    if (positionInfo!.onassetILD < 0) {
      components.push(
        `${Math.max(0, -positionInfo!.onassetILD).toLocaleString(undefined, {
          maximumFractionDigits: 8,
        })} ${positionInfo!.tickerSymbol}`
      )
    }
    if (components.length === 0)
      return "0 devUSD"

    return components.join(' + ')
  }

  const displayRewardNotional = () => {
    let reward = 0
    if (positionInfo!.collateralILD < 0)
      reward += (-positionInfo!.collateralILD)
    if (positionInfo!.onassetILD < 0)
      reward += (-positionInfo!.onassetILD * positionInfo!.price)

    return `${Math.max(0, reward).toLocaleString(undefined, { maximumFractionDigits: 8 })} USD`
  }

  return positionInfo ? (
    <>
      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={480}>
        <DialogContent sx={{ background: "#1b1b1b" }}>
          <BoxWrapper>
            <Box mb="16px">
              <Typography variant="p_xlg">Close Comet Liquidity Position</Typography>
            </Box>
            <BoxWithBorder width="261px" p="9px">
              <Stack direction="row" gap={1}>
                <Image src={positionInfo.tickerIcon} width={27} height={27} alt={positionInfo.tickerSymbol} />
                <Box>
                  <Typography variant="p_xlg">
                    {positionInfo.tickerSymbol} {"<>"} devUSD
                  </Typography>
                </Box>
              </Stack>
            </BoxWithBorder>

            <Box mt="20px" mb="22px">
              <Box display="flex" justifyContent="flex-end" mb='5px'>
                <Typography variant="p" color="#989898">
                  Wallet Balance:{" "}
                </Typography>
                <Typography variant="p" ml="5px" color={!positionInfo.isValidToClose ? { color: '#ed2525' } : {}}>
                  {`${Math.max(0, positionInfo!.onassetVal).toLocaleString(undefined, {
                    maximumFractionDigits: 5,
                  })} ${positionInfo!.tickerSymbol}`}
                </Typography>
              </Box>
              <CenterBox justifyContent="space-evenly">
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="p">ILD Debt</Typography>
                    <InfoTooltip title={TooltipTexts.ildDebt} />
                  </Box>
                  <Box lineHeight={0.95}>
                    <Box textAlign="right">
                      <Typography variant="p_xlg">{displayILDDebt()}</Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="p" color="#989898">
                        ${displayILDNotional()}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CenterBox>
              {!positionInfo.isValidToClose &&
                <Box display='flex' justifyContent='flex-end' mt='5px'>
                  <Typography variant="p" color='#ed2525'>{positionInfo!.tickerSymbol} balance not enough to pay the ILD Debt</Typography>
                </Box>
              }

              <Box display="flex" justifyContent="flex-end" mt='20px' mb='5px'>
                <Typography variant="p" color="#989898">
                  Wallet Balance:{" "}
                </Typography>
                <Typography variant="p" ml="5px">
                  {`${Math.max(0, positionInfo!.onusdVal).toLocaleString(undefined, {
                    maximumFractionDigits: 5,
                  })} devUSD`}
                </Typography>
              </Box>
              <CenterBox justifyContent="space-evenly">
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="p">Claimable Rewards</Typography>{" "}
                    <InfoTooltip title={TooltipTexts.rewards} />
                  </Box>
                  <Box lineHeight={0.95}>
                    <Box>
                      <Typography variant="p_xlg">{displayReward()}</Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="p" color="#989898">
                        ${displayRewardNotional()}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CenterBox>
            </Box>

            <BoxWithBorder mt='13px' padding='15px'>
              {positionInfo.isValidToClose ?
                <Box>
                  <Box><Typography variant='p'>Projected Healthscore</Typography> <InfoTooltip title={TooltipTexts.projectedMultipoolHealthScoreRecentering} /></Box>
                  <HealthscoreBar score={positionInfo.healthScore} prevScore={positionInfo.prevHealthScore} hideIndicator={true} width={440} />
                </Box>
                :
                <Box display='flex' justifyContent='center' my='10px'><Typography variant="p">Projected healthscore not available</Typography></Box>
              }
            </BoxWithBorder>

            <SubmitButton
              onClick={() => handleClosePosition()}
              disabled={!positionInfo.isValidToClose || isSubmitting}>
              Pay ILD, claim Rewards, and close liquidity position
            </SubmitButton>

            <Box display="flex" justifyContent="center">
              <DataLoadingIndicator onRefresh={() => refetch()} />
            </Box>
          </BoxWrapper>
        </DialogContent>
      </Dialog >
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
const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`

export default CloseLiquidityDialog
