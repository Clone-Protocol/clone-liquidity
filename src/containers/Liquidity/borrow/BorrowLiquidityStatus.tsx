import { styled } from '@mui/system'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useStatusQuery } from '~/features/MyLiquidity/Status.query'
import { useWallet } from '@solana/wallet-adapter-react'
import { TooltipTexts } from '~/data/tooltipTexts'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { formatLocaleAmount } from '~/utils/numbers'
import { OpaqueDefault } from '~/components/Overview/OpaqueArea'
import { useCometInfoQuery } from '~/features/MyLiquidity/comet/CometInfo.query'
import { useClosingAccountMutation } from '~/features/Overview/ClosingAccount.mutation'
import { useState } from 'react'

const BorrowLiquidityStatus = ({ hasNoPosition = true }: { hasNoPosition: boolean }) => {
  const { publicKey } = useWallet()
  const [loading, setLoading] = useState(false)
  const [completeClose, setCompleteClose] = useState(false)
  const { data: status } = useStatusQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  const { data: infos } = useCometInfoQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

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
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p' color={!hasNoPosition ? '#fff' : '#66707e'}>Borrowed Amount</Typography>
            <InfoTooltip title={TooltipTexts.borrowedAmount} color='#66707e' />
          </Box>
          <StatusValue>
            {status && status.statusValues &&
              <Typography variant='p_xlg'>
                {
                  status.statusValues.totalBorrowLiquidity > 0 ?
                    `$${formatLocaleAmount(status.statusValues.totalBorrowLiquidity)}`
                    : ''
                }
              </Typography>
            }
          </StatusValue>
        </Box>
        <Box>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant='p' color={!hasNoPosition ? '#fff' : '#66707e'}>Collateral in Borrow Positions</Typography>
            <InfoTooltip title={TooltipTexts.collateralInBorrow} color='#66707e' />
          </Box>
          <StatusValue>
            {status && status.statusValues &&
              <Typography variant='p_xlg'>
                {
                  status.statusValues.totalBorrowCollateralVal > 0 ?
                    `$${formatLocaleAmount(status.statusValues.totalBorrowCollateralVal)}`
                    : ''
                }
              </Typography>
            }
          </StatusValue>
        </Box>
      </Stack>
      {(publicKey && infos && infos.hasNoCollateral && status && status.statusValues.totalBorrowLiquidity === 0) &&
        <Box>
          <ViewVideoBox>
            {completeClose ? <Typography variant='p_lg' color='#fff'>Your account has been closed</Typography> :
              <>
                <Typography variant='p'>Close your account to get ~0.07 SOL back</Typography>
                <WatchButton onClick={closeCloneAccount} disabled={loading} sx={loading ? { border: '1px solid #c4b5fd', backgroundColor: '#000e22' } : {}}>Close Clone Account</WatchButton>
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
  height: 120px;
  margin-top: 16px;
  margin-bottom: 28px;
  padding: 12px 75px 28px 75px;
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
export default BorrowLiquidityStatus