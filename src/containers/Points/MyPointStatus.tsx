import { styled } from '@mui/system'
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { RankIndexForStatus } from '~/components/Points/RankItems'
import { usePointStatusQuery } from '~/features/Points/PointStatus.query'
import { useWallet } from '@solana/wallet-adapter-react'
import { OpaqueDefault } from '~/components/Overview/OpaqueArea'
import { useWalletDialog } from '~/hooks/useWalletDialog'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
// import BoltIcon from '@mui/icons-material/Bolt';
// import PromoteDialog from '~/components/Points/PromoteDialog'
import { useState } from 'react'
import { PythSymbolIcon } from '~/components/Common/SvgIcons'
import { PointTextForPyth } from '~/components/Points/PointMultiplierText'

const MyPointStatus = () => {
  const { publicKey } = useWallet()
  const { setOpen } = useWalletDialog()
  // const [showPromoteDialog, setShowPromoteDialog] = useState(true)

  const { data: infos } = usePointStatusQuery({
    userPubKey: publicKey,
    refetchOnMount: true,
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
            {infos?.hasPythPoint &&
              <Box width='42px'></Box>
            }
            <Typography variant='h3' fontWeight={500}>
              {infos?.totalPoints ? infos.totalPoints.toLocaleString() : '0'}
            </Typography>
            {infos?.hasPythPoint &&
              <Tooltip title={TooltipTexts.points.multiplier} placement="top">
                <Box width='42px'><PointTextForPyth pythPointTier={infos?.pythPointTier} /></Box>
              </Tooltip>
            }
          </StatusValue>
          {infos?.hasPythPoint &&
            <Tooltip title={TooltipTexts.points.pythSymbol} placement="top">
              <PythBox>
                <PythSymbolIcon />
              </PythBox>
            </Tooltip>
          }
        </BorderBox>
      </Stack>
      <Stack direction='row' gap={2} mt='18px'>
        <BorderBox width='250px' position='relative'>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>My Liquidity Points</Typography>
            <InfoTooltip title={TooltipTexts.points.lpPoints} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {infos?.lpPoints ? infos.lpPoints.toLocaleString() : '0'}
            </Typography>
          </StatusValue>
          {/* <PromoteBox onClick={() => setShowPromoteDialog(true)}>
            <BoltIcon sx={{ fontSize: '16px', color: '#fbdc5f' }} />
            <ColoredText><Typography variant='p_sm'>2x Multiplier</Typography></ColoredText>
          </PromoteBox> */}
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

      {/* {showPromoteDialog && <PromoteDialog onClose={() => setShowPromoteDialog(false)} />} */}
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
  gap: 14px;
  margin-top: 22px;
`
const BorderBox = styled(Box)`
  border-radius: 10px;
  border: solid 1px rgba(255, 255, 255, 0.1);
  padding-top: 14px;
  padding-bottom: 22px;
`
const PromoteBox = styled(Box)`
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 110px;
  height: 24px;
  cursor: pointer;
  border-top-left-radius: 10px;
  border-bottom-right-radius: 8px;
  background-color: rgba(255, 255, 255, 0.07);
`
const PythBox = styled(Box)`
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 37px;
  color: #e6dafe;
  border-top-left-radius: 10px;
  border-bottom-right-radius: 8px;
  background-color: rgba(255, 255, 255, 0.07);
`
const ColoredText = styled('div')`
  text-shadow: 0 0 5px rgba(252, 220, 95, 0.42);
  background-image: linear-gradient(to right, #fbdc5f 45%, #3dddff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 3px;
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

export default withSuspense(MyPointStatus, <LoadingProgress />)