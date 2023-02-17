import { Box, Stack, Grid, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useWallet } from '@solana/wallet-adapter-react'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import LiquidityPositions from './LiquidityPositions';
import Collaterals from './Collaterals';
import { useMultipoolInfoQuery } from '~/features/MyLiquidity/multipool/MultipoolInfo.query'
import HealthscoreView from '~/components/Liquidity/multipool/HealthscoreView'

const MultipoolComet = () => {
  const { publicKey } = useWallet()
  const { data: infos, refetch } = useMultipoolInfoQuery({
    userPubKey: publicKey,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  return infos ? (
    <Wrapper>
      {/* <WarningStack direction="row">
        <IconWrapper>
          <Image src={InfoBookIcon} />
        </IconWrapper>
        <WarningBox>
          Multipool comet is an advanced feature that requires thorough understanding of the mechanism. Please be sure to read and learn about it before first engaging with it.
        </WarningBox>
      </WarningStack> */}
      <Stack direction='row'>
        <Box marginRight='31px'>
          <Box><Typography variant='p' color='#989898'>Multipool Health Score</Typography></Box>
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
            <Box><Typography variant='p' color='#989898'>Multipool Colleteral Value</Typography></Box>
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
            <Box><Typography variant='p' color='#989898'>Multipool Liquidity</Typography></Box>
            <Box mt='15px'>
              <Typography variant='p_xlg'>
                {infos.totalLiquidity > 0 ? `$${infos.totalLiquidity.toLocaleString()}` : ''}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Stack>

      <BoxGrid container>
        <Grid item xs={12} md={4} sx={{ borderRight: '1px solid #535353' }}>
          <CardWrapper sx={{ paddingLeft: '20px', paddingRight: '20px' }}>
            <Box marginBottom='12px'>
              <Typography variant='p_lg'>Collateral</Typography>
            </Box>
            <Collaterals collaterals={infos.collaterals} onRefetchData={() => refetch()} />
          </CardWrapper>
        </Grid >
        <Grid item xs={12} md={8}>
          <CardWrapper sx={{ paddingLeft: '20px', paddingRight: '20px' }}>
            <Box marginBottom='12px'>
              <Typography variant='p_lg'>Liquidity</Typography>
            </Box>
            <LiquidityPositions positions={infos.positions} onRefetchData={() => refetch()} />
          </CardWrapper>
        </Grid>
      </BoxGrid >
    </Wrapper >
  ) : <></>
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

export default withSuspense(MultipoolComet, <LoadingProgress />)
