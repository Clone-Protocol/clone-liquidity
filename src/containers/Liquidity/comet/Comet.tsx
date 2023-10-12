//@Deprecated
import { Box, Stack, Grid, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useWallet } from '@solana/wallet-adapter-react'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import LiquidityPositions from './LiquidityPositions';
import Collaterals from './Collaterals';
import { useCometInfoQuery } from '~/features/MyLiquidity/comet/CometInfo.query'
import HealthscoreView from '~/components/Liquidity/comet/HealthscoreView'

const Comet = () => {
  const { publicKey } = useWallet()
  const { data: infos, refetch } = useCometInfoQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  return infos ? (
    <Wrapper>
      <Stack direction='row'>
        <Box marginRight='31px'>
          <Box><Typography variant='p' color='#989898'>Health Score</Typography></Box>
          <Box mt='15px'>
            {!infos.healthScore || Number.isNaN(infos.healthScore) ?
              <></> :
              <HealthscoreView score={infos.healthScore} />
            }
          </Box>
        </Box>
        <Box display='flex'>
          <ColumnDivider />
          <Box marginLeft='31px' marginRight='31px'>
            <Box><Typography variant='p' color='#989898'>Collateral Value</Typography></Box>
            <Box mt='15px'>
              <Typography variant='p_xlg'>
                {infos.totalCollValue > 0 ? `$${infos.totalCollValue.toLocaleString()}` : ''}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box display='flex'>
          <ColumnDivider />
          <Box marginLeft='31px'>
            <Box><Typography variant='p' color='#989898'>Liquidity</Typography></Box>
            <Box mt='15px'>
              <Typography variant='p_xlg'>
                {infos.totalLiquidity > 0 ? `$${infos.totalLiquidity.toLocaleString()}` : ''}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Stack>

      <BoxGrid container>
        <Grid item xs={12} md={3} sx={{ borderRight: '1px solid #3f3f3f' }}>
          <CardWrapper sx={{ paddingLeft: '20px', paddingRight: '20px' }}>
            <Box marginBottom='12px'>
              <Typography variant='p_lg'>Collateral</Typography>
            </Box>
            <Collaterals hasNoCollateral={infos.hasNoCollateral} collaterals={infos.collaterals} onRefetchData={() => refetch()} />
          </CardWrapper>
        </Grid>
        <Grid item xs={12} md={9}>
          <CardWrapper sx={{ paddingLeft: '20px', paddingRight: '20px' }}>
            <Box marginBottom='12px'>
              <Typography variant='p_lg'>Liquidity</Typography>
            </Box>
            {!infos.hasNoCollateral &&
              <LiquidityPositions positions={infos.positions} onRefetchData={() => refetch()} />
            }
          </CardWrapper>
        </Grid>
      </BoxGrid>
      {/* <CloseButton onClick={() => setOpenCloseEntireDlog(true)}><Typography variant='p_sm'>Close Entire Multi-pool</Typography></CloseButton>

      <CloseEntireCometPoolDialog
        open={openCloseEntireDlog}
        handleClose={() => setOpenCloseEntireDlog(false)}
      /> */}
    </Wrapper>
  ) : <><Typography variant='p_lg'>Please Connect Wallet</Typography></>
}

const Wrapper = styled(Box)`
  min-height: 550px;
  margin-top: 26px;
  margin-bottom: 25px;
  padding-top: 17px;
  padding-bottom: 17px;
`
const CardWrapper = styled(Box)`
  padding: 9px 0 12px;
`
const ColumnDivider = styled('div')`
  background: #535353; 
  width: 1px; 
  height: 120px;
`
const BoxGrid = styled(Grid)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  margin-top: 25px;
  padding: 15px 5px;
`
// const CloseButton = styled(Button)`
//   width: 239px;
//   height: 28px;
//   padding: 4px 0;
//   border: solid 1px ${(props) => props.theme.boxes.greyShade};
//   color: ${(props) => props.theme.palette.text.secondary};
//   margin-top: 9px;
//   &:hover {
//     background: ${(props) => props.theme.boxes.darkBlack};
//     color: #fff;
//     border-color: ${(props) => props.theme.palette.text.secondary};
//   }
// `

export default withSuspense(Comet, <LoadingProgress />)
