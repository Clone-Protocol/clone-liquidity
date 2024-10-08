import { styled } from '@mui/system'
import { Box, Stack, Typography } from '@mui/material'
import { useStatusQuery } from '~/features/MyLiquidity/Status.query'
import { useWallet } from '@solana/wallet-adapter-react'
import { TooltipTexts } from '~/data/tooltipTexts'
import InfoTooltip from '~/components/Common/InfoTooltip'

const BorrowLiquidityStatus = ({ hasNoPosition = true }: { hasNoPosition: boolean }) => {
  const { publicKey } = useWallet()
  const { data: status } = useStatusQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

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
                    `$${status.statusValues.totalBorrowLiquidity.toLocaleString()}`
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
                    `$${status.statusValues.totalBorrowCollateralVal.toLocaleString()}`
                    : ''
                }
              </Typography>
            }
          </StatusValue>
        </Box>
      </Stack>
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

export default BorrowLiquidityStatus