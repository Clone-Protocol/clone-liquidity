import { styled } from '@mui/system'
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material'
import HealthscoreView from '~/components/Liquidity/comet/HealthscoreView'
import { CometInfoStatus } from '~/features/MyLiquidity/comet/CometInfo.query'
import { OpaqueDefault } from '~/components/Overview/OpaqueArea'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { useWallet } from '@solana/wallet-adapter-react'
import { formatLocaleAmount } from '~/utils/numbers'
import { useClosingAccountMutation } from '~/features/Overview/ClosingAccount.mutation'
import { useState } from 'react'

const CometLiquidityStatus = ({ infos, totalApy }: { infos: CometInfoStatus | undefined, totalApy?: number }) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const [completeClose, setCompleteClose] = useState(false)
  const { mutateAsync } = useClosingAccountMutation(publicKey)

  const closeCloneAccount = async () => {
    try {
      setLoading(true)
      const data = await mutateAsync()

      if (data) {
        setLoading(false)
        console.log('data', data)
        setCompleteClose(true)
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <Wrapper>
      <Stack direction='row' gap={16}>
        {/* <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>Health Score</Typography>
            <InfoTooltip title={TooltipTexts.cometdHealthScore} color='#66707e' />
          </Box>
          <Box mt='15px'>
            <HealthscoreView score={infos && infos.healthScore ? infos.healthScore : 0} />
          </Box>
        </Box> */}
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>My Liquidity</Typography>
            <InfoTooltip title={TooltipTexts.totalLiquidity} color='#66707e' />
          </Box>
          <StatusValue>
            <Typography variant='p_xlg'>
              {infos && infos.totalLiquidity > 0 ? `$${formatLocaleAmount(infos.totalLiquidity)}` : '$0'}
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
              {infos && infos.totalCollValue > 0 ? `$${formatLocaleAmount(infos.totalCollValue)}` : '0'}
            </Typography>
          </StatusValue>
        </Box>
        {/* <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p'>My APR</Typography>
            <InfoTooltip title={TooltipTexts.yourApy} color='#66707e' />
          </Box>
          <StatusValue>
            {(infos && infos.positions.length > 0) &&
              totalApy ?
              <Box>
                {totalApy > 0 ?
                  <Box color='#4fe5ff'>
                    <Box display='flex' justifyContent='center' alignItems='center'>
                      <Typography variant='p_xlg'>{totalApy >= 0.01 ? `+${totalApy?.toFixed(2)}` : '<0.01'}%</Typography>
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
              :
              <Skeleton variant='rectangular' width={70} height={20} />
            }
          </StatusValue>
        </Box> */}
      </Stack >
      {!publicKey && <OpaqueDefault />}
      {publicKey && infos && infos.hasNoCollateral &&
        <Box>
          <ViewVideoBox>
            {completeClose ? <Typography variant='p_lg' color='#fff'>Your account has been closed</Typography> :
              <>
                <Typography variant='p'>Close your account to get ~0.07 SOL back</Typography>
                <WatchButton onClick={closeCloneAccount} disabled={loading} sx={loading ? { backgroundColor: '#4fe5ff', color: '#fff' } : {}}>Close Clone Account</WatchButton>
              </>
            }
          </ViewVideoBox>
          <OpaqueDefault />
        </Box>
      }
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
const ViewVideoBox = styled(Box)`
  position: absolute;
  left: calc(50% - 193px / 2);
  top: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 293px;
  height: 79px;
  padding: 12px 22px 11px;
  border-radius: 10px;
  background-color: #000e22;
  z-index: 999;
`
const WatchButton = styled(Button)`
  width: 169px;
  height: 32px;
  margin: 8px 0 0;
  padding: 8px 13px;
  border-radius: 5px;
  background-color: #4fe5ff;
  font-size: 12px;
  font-weight: 500;
`
export default CometLiquidityStatus