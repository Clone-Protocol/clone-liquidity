import { Box, Typography, styled } from "@mui/material"
import { useWallet } from "@solana/wallet-adapter-react"
import { SubmitButton } from "~/components/Common/CommonButtons"
import { useLiquidityPositionQuery } from "~/features/MyLiquidity/comet/LiquidityPosition.query"
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { useRewardsMutation } from "~/features/MyLiquidity/comet/LiquidityPosition.mutation"
import { useState } from "react"
import { LoadingProgress } from "~/components/Common/Loading"
import withSuspense from "~/hocs/withSuspense"
import { ON_USD } from "~/utils/constants"

const Rewards = ({ positionIndex, onRefetchData }: { positionIndex: number, onRefetchData?: () => void }) => {
  const { publicKey } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: positionInfo, refetch } = useLiquidityPositionQuery({
    userPubKey: publicKey,
    index: positionIndex,
    refetchOnMount: "always",
    enabled: publicKey != null,
  })

  const { mutateAsync } = useRewardsMutation(publicKey)
  const handleClaim = async () => {
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
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const rewardNotional = () => {
    let reward = 0
    if (positionInfo) {
      if (positionInfo.collateralILD < 0)
        reward += (-positionInfo.collateralILD)
      if (positionInfo.onassetILD < 0)
        reward += (-positionInfo.onassetILD * positionInfo.oraclePrice)
    }
    return Math.max(0, reward)
  }

  const isValidToRewards = rewardNotional() > 0 && !isSubmitting

  return positionInfo ? (
    <>
      <Box>
        <Box>
          <Typography variant='p_lg'>clAsset Rewards</Typography>
          <InfoTooltip title={TooltipTexts.rewards} color='#66707e' />
        </Box>
        <BoxWithBorder>
          <Typography variant='p_lg'>
            {Math.max(0, -positionInfo.onassetILD).toLocaleString(undefined, {
              maximumFractionDigits: 8,
            })} {positionInfo.tickerSymbol}</Typography>
          <Typography variant='p_lg' color='#66707e'>(${Math.abs(-positionInfo.onassetILD * positionInfo.oraclePrice).toLocaleString(undefined, { maximumFractionDigits: 6 })} USD)</Typography>
        </BoxWithBorder>
      </Box>
      <Box>
        <Box>
          <Typography variant='p_lg'>{ON_USD} Rewards</Typography>
          <InfoTooltip title={TooltipTexts.rewards} color='#66707e' />
        </Box>
        <BoxWithBorder>
          <Typography variant='p_lg'>
            {Math.max(0, -positionInfo.collateralILD).toLocaleString(undefined, {
              maximumFractionDigits: 8,
            })} {ON_USD}</Typography>
        </BoxWithBorder>
      </Box>
      <SubmitButton onClick={() => handleClaim()} disabled={!isValidToRewards}>
        <Typography variant='p_xlg'>{positionInfo.isValidToClose ? 'Claim Rewards' : 'No Rewards to Claim'}</Typography>
      </SubmitButton>
    </>
  ) : <></>
}

const BoxWithBorder = styled(Box)`
  width: 100%;
  height: 52px;
  display: flex;
  margin-top: 5px;
  margin-bottom: 28px;
  justify-content: flex-start;
  border-radius: 5px;
  align-items: center;
  gap: 10px;
  padding: 18px 21px;
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`

export default withSuspense(Rewards, <LoadingProgress />)
