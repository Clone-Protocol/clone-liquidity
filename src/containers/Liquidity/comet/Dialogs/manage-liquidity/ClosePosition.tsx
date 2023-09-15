import { Box, Button, Stack, Typography, styled } from "@mui/material"
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { useWallet } from "@solana/wallet-adapter-react"
import { useLiquidityPositionQuery } from "~/features/MyLiquidity/comet/LiquidityPosition.query"
import { SubmitButton } from "~/components/Common/CommonButtons"
import { useState } from "react"
import { useClosePositionMutation } from "~/features/MyLiquidity/comet/LiquidityPosition.mutation"

const ClosePosition = ({ positionIndex, onRefetchData, handleClose }: { positionIndex: number, onRefetchData: () => void, handleClose: () => void }) => {
  const { publicKey } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: positionInfo, refetch } = useLiquidityPositionQuery({
    userPubKey: publicKey,
    index: positionIndex,
    refetchOnMount: "always",
    enabled: publicKey != null,
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
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const positionLiquidity = 0
  const ildBalance = 0
  const remainRewards = 0

  return positionInfo ? (
    <>
      <Box>
        <Box>
          <Typography variant='p_lg'>Step 1: Withdraw Liquidity (0% Liquidity)</Typography>
          <InfoTooltip title={TooltipTexts.rewards} />
        </Box>
        <StackWithBorder direction='row' justifyContent='space-between'>
          <Typography variant='p_lg' color={positionLiquidity > 0 ? '#fff' : '#66707e'}>
            {positionLiquidity.toLocaleString(undefined, {
              maximumFractionDigits: 8,
            })} USD
          </Typography>

          {positionLiquidity === 0 ?
            <Typography variant="p">No Liquidity Remaining</Typography>
            :
            <GoButton><Typography variant="p_lg">Withdraw Liquidity</Typography></GoButton>
          }
        </StackWithBorder>
      </Box>
      <Box>
        <Box>
          <Typography variant='p_lg'>Step 2: Pay Entire ILD Balance</Typography>
          <InfoTooltip title={TooltipTexts.rewards} />
        </Box>
        <StackWithBorder direction='row' justifyContent='space-between'>
          <Typography variant='p_lg' color={ildBalance > 0 ? '#fff' : '#66707e'}>
            {ildBalance.toLocaleString(undefined, {
              maximumFractionDigits: 8,
            })} USD</Typography>

          {positionLiquidity === 0 ?
            <Typography variant="p">No ILD Remaining</Typography>
            :
            <GoButton><Typography variant="p_lg">Pay ILD</Typography></GoButton>
          }
        </StackWithBorder>
      </Box>
      <Box>
        <Box>
          <Typography variant='p_lg'>Step 3: Claim All Rewards</Typography>
          <InfoTooltip title={TooltipTexts.rewards} />
        </Box>
        <StackWithBorder direction='row' justifyContent='space-between'>
          <Typography variant='p_lg' color={remainRewards > 0 ? '#fff' : '#66707e'}>
            {remainRewards.toLocaleString(undefined, {
              maximumFractionDigits: 8,
            })} USD</Typography>
          {positionLiquidity === 0 ?
            <Typography variant="p">No Rewards Remaining</Typography>
            :
            <GoButton><Typography variant="p_lg">Claim Rewards</Typography></GoButton>
          }
        </StackWithBorder>
      </Box>

      <Box>
        <Typography variant='p_lg'>Step 4 (Final Step): Close This Liquidity Position</Typography>
        <InfoTooltip title={TooltipTexts.rewards} />
      </Box>
      <SubmitButton onClick={() => handleClosePosition()} disabled={!positionInfo.isValidToClose || isSubmitting}>
        <Typography variant='p_xlg'>{positionInfo.isValidToClose ? 'Close This Liquidity Position' : 'Please Complete Step 1,2, and 3'}</Typography>
      </SubmitButton>
    </>
  ) : <></>
}

const StackWithBorder = styled(Stack)`
  width: 100%;
  height: 52px;
  margin-top: 15px;
  margin-bottom: 38px;
  border-radius: 5px;
  align-items: center;
  gap: 10px;
  padding: 18px 21px;
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`
const GoButton = styled(SubmitButton)`
  width: 200px;
`

export default ClosePosition