import { Box, Stack, Grid, Button } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import InfoBookIcon from 'public/images/info-book-icon.png'
import InfoTooltip from '~/components/Common/InfoTooltip';
import LiquidityPositions from './LiquidityPositions';
import Collaterals from './Collaterals';

const MultipoolComet = () => {


  return (
    <Wrapper>
      <Stack
        sx={{
          background: 'rgba(207, 170, 255, 0.09)',
          border: '1px solid #8c73ac',
          borderRadius: '10px',
          color: '#989898',
          padding: '8px',
          marginBottom: '26px',
        }}
        direction="row">
        <Box sx={{ width: '73px', textAlign: 'center', marginTop: '6px' }}>
          <Image src={InfoBookIcon} />
        </Box>
        <WarningBox>
          Multipool comet is an advanced feature that requires thorough understanding of the mechanism. Please besure to read and learn about it before first engaging with it.
        </WarningBox>
      </Stack>

      <Grid container spacing={2}>
			  <Grid item xs={12} md={2}>
          <CardWrapper>
            <SubTitle>Mulipool Comet Health Score <InfoTooltip title="Mulipool Comet Health Score" /></SubTitle>
            <SubValue><span style={{ fontSize: '16px', fontWeight: '600' }}>75</span>/100</SubValue>
          </CardWrapper>
          <CardWrapper>
            <Box>
              <SubTitle>Total Collateral Value <InfoTooltip title="Total Collateral Value" /></SubTitle>
              <SubValue><span style={{ fontSize: '14px', fontWeight: '500' }}>90,094.95</span>USD</SubValue>
            </Box>
            <Divider />
            <Box>
              <SubTitle>Total Liquidity <InfoTooltip title="Total Liquidity" /></SubTitle>
              <SubValue><span style={{ fontSize: '14px', fontWeight: '500' }}>50,094.95</span>USD</SubValue>
            </Box>
          </CardWrapper>
        </Grid>
        <Grid item xs={12} md={5}>
          <CardWrapper>
            <SubTitle>Collaterals <InfoTooltip title="Collaterals" /></SubTitle>
            <Collaterals />
          </CardWrapper>
        </Grid>
        <Grid item xs={12} md={5}>
          <CardWrapper>
            <SubTitle>Contributed Liquidity Positions <InfoTooltip title="Contributed Liquidity Positions" /></SubTitle>
            <LiquidityPositions />
          </CardWrapper>
        </Grid>
      </Grid>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  margin-top: 26px;
`

const WarningBox = styled(Box)`
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
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
  margin: 18px 12px 12px 0;
  background-color: #535353;
`

export default MultipoolComet
