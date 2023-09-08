import { styled } from '@mui/system'
import { Box, Stack, Typography } from '@mui/material'
import HealthscoreView from '~/components/Liquidity/comet/HealthscoreView'
import Image from 'next/image'
import ArrowUpward from 'public/images/arrow-upward.svg'
import ArrowDownward from 'public/images/arrow-downward.svg'
import { CometInfoStatus } from '~/features/MyLiquidity/comet/CometInfo.query'
import { OpaqueDefault } from '~/components/Overview/OpaqueArea'

const CometLiquidityStatus = ({ infos }: { infos: CometInfoStatus | undefined }) => {

  return (
    <Wrapper>
      <Stack direction='row' gap={16}>
        <Box>
          <Box display='flex' justifyContent='center'><Typography variant='p'>Comet Health Score</Typography></Box>
          <Box mt='15px'>
            <HealthscoreView score={infos && infos.healthScore ? infos.healthScore : 0} />
          </Box>
        </Box>
        <Box>
          <Box display='flex' justifyContent='center'><Typography variant='p'>Your Liquidity</Typography></Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {infos && infos.totalLiquidity > 0 ? `$${infos.totalLiquidity.toLocaleString()}` : ''}
            </Typography>
          </StatusValue>
        </Box>
        <Box>
          <Box display='flex' justifyContent='center'><Typography variant='p'>Your Colleteral</Typography></Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {infos && infos.totalCollValue > 0 ? `$${infos.totalCollValue.toLocaleString()}` : ''}
            </Typography>
          </StatusValue>
        </Box>
        <Box>
          <Box display='flex' justifyContent='center'><Typography variant='p'>Your PNL</Typography></Box>
          <StatusValue>
            <Box color='#4fe5ff'>
              <Typography variant='p_xlg'>+$14,452.34</Typography>
              <Box display='flex' justifyContent='center' alignItems='center'>
                <Typography variant='p'>+3.47%</Typography>
                <Image src={ArrowUpward} alt='arrowUp' />
              </Box>
            </Box>
            {/* :
                <Box color='#ff0084'>
                  <Typography variant='p_xlg'>-$14,452.34</Typography>
                  <Box display='flex' alignItems='center'>
                    <Typography variant='p_xlg'>-3.47%</Typography>
                    <Image src={ArrowDownward} alt='arrowDown' />
                  </Box>
                </Box> */}
          </StatusValue>
        </Box>
      </Stack>
      {(!infos || infos.hasNoCollateral) && <OpaqueDefault />}
    </Wrapper>
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