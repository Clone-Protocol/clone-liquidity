///@Deprecated
import { Box, Stack, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { Status } from '~/features/MyLiquidity/Status.query'

const MyStatusValues = ({ tab, status }: { tab: number, status: Status }) => {
  const statusValues = status ? {
    totalBorrowLiquidity: status.statusValues.totalBorrowLiquidity,
    totalBorrowCollateralVal: status.statusValues.totalBorrowCollateralVal,
  } : {
    totalBorrowLiquidity: 0,
    totalBorrowCollateralVal: 0,
  }

  return (
    <>
      {tab === 1 &&
        <Stack direction='row'>
          <Box marginRight='66px'>
            <Box><Typography variant='p' color='#989898'>Total Debt Value</Typography></Box>
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