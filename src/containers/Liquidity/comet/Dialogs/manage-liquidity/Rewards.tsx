import { Box, Typography, styled } from "@mui/material"
import { useWallet } from "@solana/wallet-adapter-react"
import { SubmitButton } from "~/components/Common/CommonButtons"
import { useLiquidityPositionQuery } from "~/features/MyLiquidity/comet/LiquidityPosition.query"
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { useClosePositionMutation } from "~/features/MyLiquidity/comet/LiquidityPosition.mutation"
import { useState } from "react"

const Rewards = ({ positionIndex }: { positionIndex: number }) => {
  const { publicKey } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: positionInfo, refetch } = useLiquidityPositionQuery({
    userPubKey: publicKey,
    index: positionIndex,
    refetchOnMount: "always",
    enabled: publicKey != null,
  })

  const displayRewardNotional = () => {
    let reward = 0
    if (positionInfo!.collateralILD < 0)
      reward += (-positionInfo!.collateralILD)
    if (positionInfo!.onassetILD < 0)
      reward += (-positionInfo!.onassetILD * positionInfo!.price)

    return `${Math.max(0, reward).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`
  }

  const { mutateAsync } = useClosePositionMutation(publicKey)
  const handleClaim = async () => {
    try {
      setIsSubmitting(true)

      // if (data) {
      //   console.log("data", data)
      //   refetch()
      //   onRefetchData()
      //   handleClose()
      // }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }


  return positionInfo ? (
    <>
      <Box>
        <Box>
          <Typography variant='p_lg'>onAsset Rewards</Typography>
          <InfoTooltip title={TooltipTexts.rewards} />
        </Box>
        <BoxWithBorder>
          <Typography variant='p_lg'>
            {Math.max(0, positionInfo.onassetILD).toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })} {positionInfo.tickerSymbol}</Typography>
          <Typography variant='p_lg' color='#66707e'>(${displayRewardNotional()})</Typography>
        </BoxWithBorder>
      </Box>
      <Box>
        <Box><Typography variant='p_lg'>devUSD Rewards</Typography></Box>
        <BoxWithBorder>
          <Typography variant='p_lg'>
            {Math.max(0, positionInfo.collateralILD).toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })} devUSD</Typography>
        </BoxWithBorder>
      </Box>
      <SubmitButton onClick={() => handleClaim()} disabled={!positionInfo.isValidToClose || isSubmitting}>
        <Typography variant='p_xlg'>{positionInfo.isValidToClose ? 'Claim Rewards' : 'No Rewards to Claim'}</Typography>
      </SubmitButton>
    </>
  ) : <></>
}

const BoxWithBorder = styled(Box)`
  width: 100%;
  height: 52px;
  display: flex;
  margin-top: 15px;
  margin-bottom: 38px;
  justify-content: flex-start;
  border-radius: 5px;
  align-items: center;
  gap: 10px;
  padding: 18px 21px;
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`

export default Rewards