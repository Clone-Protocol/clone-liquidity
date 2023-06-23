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
    refetchOnMount: true,
    enabled: open && publicKey != null,
  })

  const { mutateAsync } = useClosePositionMutation(publicKey)
  const handleClosePosition = async () => {
    try {
      setIsSubmitting(true)
      const data = await mutateAsync({
        positionIndex,
        onusdBalance: positionInfo?.onusdVal!,
        onusdILD: positionInfo?.onusdILD!,
        onassetBalance: positionInfo?.onassetVal!,
        onassetILD: positionInfo?.onassetILD!,
        onassetMint: positionInfo?.onassetMint!,
        committedOnusdLiquidity: positionInfo?.committedOnusdLiquidity!,
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
    if (positionInfo!.onusdILD > 0) {
      components.push(
        `${Math.max(0, positionInfo!.onusdILD).toLocaleString(undefined, {
          maximumFractionDigits: 5,
        })} onUSD`
      )
    }
    if (positionInfo!.onassetILD > 0) {
      components.push(
        `${Math.max(0, positionInfo!.onassetILD).toLocaleString(undefined, {
          maximumFractionDigits: 5,
        })} ${positionInfo!.tickerSymbol}`
      )
    }

    if (components.length === 0)
      return "0 onUSD"
    
    return components.join(' + ')
  }

  const displayILDNotional = () => {
    let reward = 0
    if (positionInfo!.onusdILD > 0)
      reward += positionInfo!.onusdILD
    if (positionInfo!.onassetILD > 0)
      reward += positionInfo!.onassetILD * positionInfo!.price

    return `${Math.max(0, reward).toLocaleString(undefined, {maximumFractionDigits: 5})} USD`
  }

  const displayReward = () => {
    let components = []
    if (positionInfo!.onusdILD < 0) {
      components.push(
        `${Math.max(0, -positionInfo!.onusdILD).toLocaleString(undefined, {
          maximumFractionDigits: 5,
        })} onUSD`
      )
    }
    if (positionInfo!.onassetILD < 0) {
      components.push(
        `${Math.max(0, -positionInfo!.onassetILD).toLocaleString(undefined, {
          maximumFractionDigits: 5,
        })} ${positionInfo!.tickerSymbol}`
      )
    }
    if (components.length === 0)
      return "0 onUSD"
    
    return components.join(' + ')
  }

  const displayRewardNotional = () => {
    let reward = 0
    if (positionInfo!.onusdILD < 0)
      reward += (-positionInfo!.onusdILD)
    if (positionInfo!.onassetILD < 0)
      reward += (-positionInfo!.onassetILD * positionInfo!.price)

    return `${Math.max(0, reward).toLocaleString(undefined, {maximumFractionDigits: 5})} USD`
  }

  const displayWalletBalance = () => {
    let components = []
    components.push(
      `${Math.max(0, positionInfo!.onusdVal).toLocaleString(undefined, {
        maximumFractionDigits: 5,
      })} onUSD`
    )  
    components.push(
      `${Math.max(0, positionInfo!.onassetVal).toLocaleString(undefined, {
        maximumFractionDigits: 5,
      })} ${positionInfo!.tickerSymbol}`
    )

    return components.join(' + ')
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
                <Image src={positionInfo.tickerIcon} width="27px" height="27px" />
                <Box>
                  <Typography variant="p_xlg">
                    {positionInfo.tickerSymbol} {"<>"} onUSD
                  </Typography>
                </Box>
              </Stack>
            </BoxWithBorder>

            <Box marginTop="20px" marginBottom="22px">
              <Box display="flex" justifyContent="flex-end">
                <Typography variant="p" color="#989898">
                  Wallet Balance:{" "}
                </Typography>
                <Typography variant="p" ml="5px">
                  {displayWalletBalance()}
                </Typography>
              </Box>
              <CenterBox justifyContent="space-evenly">
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="p">ILD Debt</Typography>{" "}
                    <InfoTooltip title={TooltipTexts.ildDebt} />
                  </Box>
                  <Box lineHeight={0.95}>
                    <Box>
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

            <SubmitButton
              onClick={() => handleClosePosition()}
              disabled={!positionInfo.isValidToClose || isSubmitting}>
              Claim Rewards, Pay ILD & Close Liquidity Position
            </SubmitButton>

            <Box display="flex" justifyContent="center">
              <DataLoadingIndicator onRefresh={() => refetch()} />
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
const BoxWithBorder = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
`

export default CloseLiquidityDialog
