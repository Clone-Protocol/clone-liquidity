import { styled } from '@mui/system'
import { Box, Stack, Typography } from '@mui/material'
import HealthscoreView from '~/components/Liquidity/comet/HealthscoreView'
import { CometInfoStatus } from '~/features/MyLiquidity/comet/CometInfo.query'
import { OpaqueDefault } from '~/components/Overview/OpaqueArea'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'

const CometLiquidityStatus = ({ infos }: { infos: CometInfoStatus | undefined }) => {

  return (
    <Wrapper>
      <Stack direction='row' gap={16}>
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>Health Score</Typography>
            <InfoTooltip title={TooltipTexts.cometdHealthScore} color='#66707e' />
          </Box>
          <Box mt='15px'>
            <HealthscoreView score={infos && infos.healthScore ? infos.healthScore : 0} />
          </Box>
        </Box>
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>My Liquidity</Typography>
            <InfoTooltip title={TooltipTexts.totalLiquidity} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {infos && infos.totalLiquidity > 0 ? `$${infos.totalLiquidity.toLocaleString()}` : '$0'}
            </Typography>
          </StatusValue>
        </Box>
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>My Collateral</Typography>
            <InfoTooltip title={TooltipTexts.totalCollateralValue} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {infos && infos.totalCollValue > 0 ? `$${infos.totalCollValue.toLocaleString()}` : '0'}
            </Typography>
          </StatusValue>
        </Box>
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>My APR</Typography>
            <InfoTooltip title={TooltipTexts.yourApy} color='#66707e' />
          </Box>
          <StatusValue>
            {(infos && infos.positions.length > 0 && !isNaN(infos.totalApy)) &&
              <Box>
                {infos.totalApy > 0 ?
                  <Box color='#4fe5ff'>
                    <Box display='flex' justifyContent='center' alignItems='center'>
                      <Typography variant='p_xlg'>{infos.totalApy >= 0.01 ? `+${infos.totalApy?.toFixed(2)}` : '<0.01'}%</Typography>
                    </Box>
                  </Box>
                  :
                  <Box color='white'>
                    <Box display='flex' alignItems='center'>
                      <Typography variant='p_xlg'>{'0.00'}%</Typography>
                    </Box>
                  </Box>
                }
              </Box>
            }
          </StatusValue>
        </Box>
      </Stack >
      {(!infos || infos.hasNoCollateral) && <OpaqueDefault />}
    </Wrapper >
  )

}

const Wrapper = styled(Box)`
  position: relative;
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

export default CometLiquidityStatus