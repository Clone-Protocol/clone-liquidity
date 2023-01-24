import { Box, Stack, Typography } from '@mui/material'
import { styled } from '@mui/system'

const MyStatusValues = ({ tab }: { tab: number }) => {


  return (
    <>
      {tab === 1 &&
        <Stack direction='row'>
          <Box marginRight='66px'>
            <Box><Typography variant='p' color='#989898'>Total Singlepool Comet Liquidity</Typography></Box>
            <Box>
              <Typography variant='p_xlg'>
                {/* {formatDollarAmount(status.totalVal, 0, true)} */}
                $1,535,356.02
              </Typography>
            </Box>
          </Box>
          <Box display='flex'>
            <ColumnDivider />
            <Box marginLeft='81px'>
              <Box><Typography variant='p' color='#989898'>Total Value Locked in Singlepool Comet</Typography></Box>
              <Box>
                <Typography variant='p_xlg'>
                  {/* {formatDollarAmount(status.totalVal, 0, true)} */}
                  $1,535,356.02
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
              {/* {formatDollarAmount(status.totalVal, 0, true)} */}
              $1,535,356.02
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
                {/* {formatDollarAmount(status.totalVal, 0, true)} */}
                $1,535,356.02
              </Typography>
            </Box>
          </Box>
          <Box display='flex'>
            <ColumnDivider />
            <Box marginLeft='81px'>
              <Box><Typography variant='p' color='#989898'>Total Collateral Value</Typography></Box>
              <Box>
                <Typography variant='p_xlg'>
                  {/* {formatDollarAmount(status.totalVal, 0, true)} */}
                  $535,356.02
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