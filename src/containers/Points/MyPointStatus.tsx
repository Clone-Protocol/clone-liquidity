import { styled } from '@mui/system'
import { Box, Button, Stack, Typography } from '@mui/material'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { RankIndexForStatus } from '~/components/Points/RankItems'
import { usePointStatusQuery } from '~/features/Points/PointStatus.query'
import { useWallet } from '@solana/wallet-adapter-react'
import { OpaqueDefault } from '~/components/Overview/OpaqueArea'
import { useWalletDialog } from '~/hooks/useWalletDialog'

const MyPointStatus = () => {
  const { publicKey } = useWallet()
  const { setOpen } = useWalletDialog()

  const { data: infos, refetch } = usePointStatusQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  return (
    <Wrapper>
      <Stack direction='row' gap={2}>
        <BorderBox width='176px'>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p_lg'>Global Rank</Typography>
          </Box>
          <StatusValue>
            <RankIndexForStatus rank={infos?.myRank} />
          </StatusValue>
        </BorderBox>
        <BorderBox width='350px' position='relative'>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p_lg'>My Total Points</Typography>
            <InfoTooltip title={TooltipTexts.points.totalPoints} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='h3' fontWeight={500}>
              {infos?.totalPoints ? infos.totalPoints.toLocaleString() : '0'}
            </Typography>
          </StatusValue>
        </BorderBox>
      </Stack>
      <Stack direction='row' gap={2} mt='18px'>
        <BorderBox width='250px'>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>My Liquidity Points</Typography>
            <InfoTooltip title={TooltipTexts.points.lpPoints} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {infos?.lpPoints ? infos.lpPoints.toLocaleString() : '0'}
            </Typography>
          </StatusValue>
        </BorderBox>
        <BorderBox width='250px'>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>My Trade Points</Typography>
            <InfoTooltip title={TooltipTexts.points.tradePoints} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {infos?.tradePoints ? infos.tradePoints.toLocaleString() : '0'}
            </Typography>
          </StatusValue>
        </BorderBox>
        <BorderBox width='250px'>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>My Social Points</Typography>
            <InfoTooltip title={TooltipTexts.points.socialPoints} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {infos?.socialPoints ? infos.socialPoints.toLocaleString() : '0'}
            </Typography>
          </StatusValue>
        </BorderBox>
      </Stack>
      {!publicKey && <>
        <OpaqueDefault />
        <Box position='absolute' top='20px' marginY='55px' marginX='213px'>
          <Box display='flex' justifyContent='center' mb='7px'><Typography variant='p_lg'>To see your points: </Typography></Box>
          <ConnectWallet onClick={() => setOpen(true)}><Typography variant='p_xlg'>Connect Wallet</Typography></ConnectWallet>
        </Box>
      </>}
    </Wrapper>
  )

}

const Wrapper = styled(Box)`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 28px;
  padding: 12px 28px;
`
const StatusValue = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 22px;
`
const BorderBox = styled(Box)`
  border-radius: 10px;
  border: solid 1px rgba(255, 255, 255, 0.1);
  padding-top: 14px;
  padding-bottom: 22px;
`
const ClickBox = styled(Box)`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 10px;
  font-weight: 500;
  margin: 4px 6px;
  cursor: pointer;
  color: ${(props) => props.theme.basis.slug};
`
const ConnectWallet = styled(Button)`
  width: 266px;
  height: 52px;
  object-fit: contain;
  border-radius: 5px;
  box-shadow: 0 0 15px 0 #005874;
  border: solid 1px ${(props) => props.theme.basis.liquidityBlue};
  background-color: #000;
  color: #fff;
  &:hover {
    background-color: #000;
    border-color: ${(props) => props.theme.basis.gloomyBlue}};
  }
`

export default MyPointStatus