import { Box, Stack, Typography } from '@mui/material'
import { styled } from '@mui/system'

const MyStatusValues = ({ tab }: { tab: number }) => {

  const statusValues = {
    totalCometLiquidity: 1535356.02,
    totalCometValLocked: 1535356.02,
    totalUnconcentPositionVal: 1535356.02,
    totalBorrowLiquidity: 1535356.02,
    totalBorrowCollateralVal: 535356.02,
  }

  return (
    <>
      {tab === 1 &&
        <Stack direction='row'>
          <Box marginRight='66px'>
            <Box><Typography variant='p' color='#989898'>Total Singlepool Comet Liquidity</Typography></Box>
            <Box>
              <Typography variant='p_xlg'>
                {
                  statusValues.totalCometLiquidity > 0 ?
                    `$${statusValues.totalCometLiquidity.toLocaleString()}`
                    : ''
                }
              </Typography>
            </Box>
          </Box>
          <Box display='flex'>
            <ColumnDivider />
            <Box marginLeft='81px'>
              <Box><Typography variant='p' color='#989898'>Total Value Locked in Singlepool Comet</Typography></Box>
              <Box>
                <Typography variant='p_xlg'>
                  {
                    statusValues.totalCometValLocked > 0 ?
                      `$${statusValues.totalCometValLocked.toLocaleString()}`
                      : ''
                  }
                </Typography>
              </Box>
            </Box>
          </Box>
        </Stack>
      }
      {tab === 2 &&
        <Box>
          <Box><Typography variant='p' color='#989898'>Total Position Value</Typography></Box>
          <Box>
            <Typography variant='p_xlg'>
              {
                statusValues.totalUnconcentPositionVal > 0 ?
                  `$${statusValues.totalUnconcentPositionVal.toLocaleString()}`
                  : ''
              }
            </Typography>
          </Box>
        </Box>
      }
      {tab === 3 &&
        <Stack direction='row'>
          <Box marginRight='66px'>
            <Box><Typography variant='p' color='#989898'>Total Liquidity Value</Typography></Box>
            <Box>
              <Typography variant='p_xlg'>
                {
                  statusValues.totalBorrowLiquidity > 0 ?
                    `$${statusValues.totalBorrowLiquidity.toLocaleString()}`
                    : ''
                }
              </Typography>
            </Box>
          </Box>
          <Box display='flex'>
            <ColumnDivider />
            <Box marginLeft='81px'>
              <Box><Typography variant='p' color='#989898'>Total Collateral Value</Typography></Box>
              <Box>
                <Typography variant='p_xlg'>
                  {
                    statusValues.totalBorrowCollateralVal > 0 ?
                      `$${statusValues.totalBorrowCollateralVal.toLocaleString()}`
                      : ''
                  }
                </Typography>
              </Box>
            </Box>
          </Box>
        </Stack>
      }
    </>
  )
}

const ColumnDivider = styled('div')`
  background: #535353; 
  width: 1px; 
  height: 49px;
`

export default MyStatusValues;