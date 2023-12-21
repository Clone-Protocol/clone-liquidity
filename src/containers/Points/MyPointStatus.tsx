import { styled } from '@mui/system'
import { Box, Stack, Typography } from '@mui/material'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { RankIndex } from '~/components/Points/RankItems'

const MyPointStatus = () => {

  return (
    <Wrapper>
      <Stack direction='row' gap={16}>
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>Global Rank</Typography>
          </Box>
          <StatusValue>
            <RankIndex rank={1} />
          </StatusValue>
        </Box>
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>Your Total Points</Typography>
            <InfoTooltip title={TooltipTexts.points.totalPoints} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {/* {infos && infos.totalLiquidity > 0 ? `$${infos.totalLiquidity.toLocaleString()}` : '$0'} */}
            </Typography>
          </StatusValue>
        </Box>
      </Stack>
      <Stack direction='row' gap={16}>
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>Your LP Points</Typography>
            <InfoTooltip title={TooltipTexts.points.lpPoints} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {/* {infos && infos.totalLiquidity > 0 ? `$${infos.totalLiquidity.toLocaleString()}` : '$0'} */}
            </Typography>
          </StatusValue>
        </Box>
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>Your Trade Points</Typography>
            <InfoTooltip title={TooltipTexts.points.tradePoints} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {/* {infos && infos.totalCollValue > 0 ? `$${infos.totalCollValue.toLocaleString()}` : '0'} */}
            </Typography>
          </StatusValue>
        </Box>
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>Your Social Points</Typography>
            <InfoTooltip title={TooltipTexts.points.socialPoints} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {/* {infos && infos.totalCollValue > 0 ? `$${infos.totalCollValue.toLocaleString()}` : '0'} */}
            </Typography>
          </StatusValue>
        </Box>
      </Stack>
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
  border-radius: 10px;
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`
const StatusValue = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
`

export default MyPointStatus