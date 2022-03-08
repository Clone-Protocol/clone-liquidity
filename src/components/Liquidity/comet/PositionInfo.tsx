import { Box, Stack, Button, Divider, Card } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import ethLogo from '../../../../public/images/assets/ethereum-eth-logo.svg'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'

interface Props {
}

const PositionInfo: React.FC = () => {

  return (
    <Box sx={{ background: '#000', color: '#fff' }}>
      <PriceIndicatorBox tickerIcon={ethLogo} tickerName="iSolana" tickerSymbol="iSOL" value={111.01} />

      <Box sx={{ background: '#171717', color: '#fff', padding: '25px', marginTop: '15px' }}>
        <Title>Comet Position</Title>
        <Box>
          <Box>
            <SubTitle>Collateral</SubTitle>
            <Box sx={{ fontSize: '18px', fontWeight: '500' }}>
              80,450.85 USDC
            </Box>
            <Box sx={{ marginTop: '10px' }}>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Contributed USDi</DetailHeader>
                <DetailValue>100,000.00 USDi</DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Contributed iAsset</DetailHeader>
                <DetailValue>1,000.00 iSOL</DetailValue>
              </Stack>
            </Box>
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>Price Range</SubTitle>
            <Box sx={{ marginTop: '20px' }}>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Center price</DetailHeader>
                <DetailValue>100.58 USD</DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Lower limit</DetailHeader>
                <DetailValue>50.43 USD</DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Upper limit</DetailHeader>
                <DetailValue>150.89 USD</DetailValue>
              </Stack>
            </Box>
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>ILD</SubTitle>
            <Box sx={{ fontSize: '18px', fontWeight: '500' }}>
              450.87 USDC
            </Box>
          </Box>
          <StyledDivider />

          <ActionButton>Recenter</ActionButton>
        </Box>
      </Box>
    </Box>
  )
}

const StyledDivider = styled(Divider)`
  background-color: #535353;
  margin-bottom: 15px;
  margin-top: 15px;
  height: 1px;
`

const Title = styled('div')`
  font-size: 20px;
  font-weight: 600;
  color: #FFF;
  margin-bottom: 20px;
`

const SubTitle = styled('div')`
  font-size: 16px;
  font-weight: 600;
  color: #989898;
`

const DetailHeader = styled('div')`
  font-size: 12px;
  font-weight: 500;
  color: #989898;
`

const DetailValue = styled('div')`
  font-size: 12px;
  font-weight: 500;
  color: #fff;
`

const ActionButton = styled(Button)`
  width: 100%;
  border-radius: 10px;
  border-style: solid;
  border-width: 2px;
  border-image-source: linear-gradient(to right, #00f0ff -1%, #0038ff 109%);
  border-image-slice: 1;
  color: #fff;
`

export default withCsrOnly(PositionInfo)