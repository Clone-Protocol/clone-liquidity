import { Box, Stack, Grid } from '@mui/material'
import { styled } from '@mui/system'
import { useWallet } from '@solana/wallet-adapter-react'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import Image from 'next/image'
import InfoBookIcon from 'public/images/info-book-icon.svg'
import InfoTooltip from '~/components/Common/InfoTooltip';
import LiquidityPositions from './LiquidityPositions';
import Collaterals from './Collaterals';
import { useMultipoolInfoQuery } from '~/features/MyLiquidity/multipool/MultipoolInfo.query'

const MultipoolComet = () => {
  const { publicKey } = useWallet()
  const { data: infos, refetch } = useMultipoolInfoQuery({
    userPubKey: publicKey,
	  refetchOnMount: "always",
    enabled: publicKey != null
	})

  return infos ? (
    <Wrapper>
      <Stack
        sx={{
          background: 'rgba(207, 170, 255, 0.09)',
          border: '1px solid #8c73ac',
          borderRadius: '10px',
          color: '#989898',
          padding: '8px',
          marginBottom: '26px',
          height: '41px'
        }}
        direction="row">
        <Box sx={{ width: '73px', textAlign: 'center', marginTop: '2px' }}>
          <Image src={InfoBookIcon} />
        </Box>
        <WarningBox>
          Multipool comet is an advanced feature that requires thorough understanding of the mechanism. Please be sure to read and learn about it before first engaging with it.
        </WarningBox>
      </Stack>

      <Grid container spacing={2}>
			  <Grid item xs={12} md={2}>
          <CardWrapper>
            <SubTitle style={{ marginLeft: '8px' }}>Mulipool Comet Health Score <InfoTooltip title="Mulipool Comet Health Score" /></SubTitle>
            <SubValue style={{ textAlign: 'center' }}><span style={{ fontSize: '16px', fontWeight: '600' }}>{Number.isNaN(infos.healthScore) ? '--' : infos.healthScore.toFixed(2)}</span>/100</SubValue>
          </CardWrapper>
          <CardWrapper style={{ marginTop: '13px' }}>
            <Box>
              <SubTitle style={{ marginLeft: '16px' }}>Total Collateral Value <InfoTooltip title="Total Collateral Value" /></SubTitle>
              <SubValue style={{ marginLeft: '16px' }}><span style={{ fontSize: '14px', fontWeight: '500' }}>{infos.totalCollValue.toLocaleString()}</span> USD</SubValue>
            </Box>
            <Divider />
            <Box>
              <SubTitle style={{ marginLeft: '16px' }}>Total Liquidity <InfoTooltip title="Total Liquidity" /></SubTitle>
              <SubValue style={{ marginLeft: '16px' }}><span style={{ fontSize: '14px', fontWeight: '500' }}>{infos.totalLiquidity.toLocaleString()}</span> USD</SubValue>
            </Box>
          </CardWrapper>
        </Grid>
        <Grid item xs={12} md={4}>
          <CardWrapper sx={{ paddingLeft: '20px', paddingRight: '20px'}}>
            <SubTitle>Collaterals <InfoTooltip title="Collaterals" /></SubTitle>
            <Collaterals collaterals={infos.collaterals} onRefetchData={() => refetch()}  />
          </CardWrapper>
        </Grid>
        <Grid item xs={12} md={6}>
          <CardWrapper sx={{ paddingLeft: '20px', paddingRight: '20px'}}>
            <SubTitle>Contributed Liquidity Positions <InfoTooltip title="Contributed Liquidity Positions" /></SubTitle>
            <LiquidityPositions positions={infos.positions} onRefetchData={() => refetch()}  />
          </CardWrapper>
        </Grid>
      </Grid>
    </Wrapper>
  ) : <></>
}

const Wrapper = styled(Box)`
  min-height: 550px;
  margin-top: 26px;
  margin-bottom: 25px;
  padding-top: 17px;
  padding-bottom: 17px;
`

const WarningBox = styled(Box)`
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
  margin-top: 3px;
`

const CardWrapper = styled(Box)`
  padding: 9px 0 12px;
  border-radius: 10px;
  background-color: #1d1d1d;
`

const SubTitle = styled('div')`
  font-family: Montserrat;
  font-size: 10px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
	color: #989898;
`

const SubValue = styled('div')`
  font-family: Montserrat;
  font-size: 10px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #fff;
`

const Divider = styled('div')`
  width: 140px;
  height: 1px;
  margin: 18px 12px 12px 10px;
  background-color: #535353;
`

export default withSuspense(MultipoolComet, <LoadingProgress />)
