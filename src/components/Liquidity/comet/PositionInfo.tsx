import { Box, Stack, Button, Divider } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import { PositionInfo as PI } from '~/web3/MyLiquidity/CometPosition'

interface Props {
  positionInfo: PI
}

const PositionInfo: React.FC<Props> = ({ positionInfo }) => {

  const onRecenter = () => {
  }

  return positionInfo ? (
    <Box sx={{ background: '#000', color: '#fff' }}>
      <PriceIndicatorBox tickerIcon={positionInfo.tickerIcon} tickerName={positionInfo.tickerName} tickerSymbol={positionInfo.tickerSymbol} value={positionInfo.price} />

      <Box sx={{ background: '#171717', color: '#fff', padding: '25px', marginTop: '15px' }}>
        <Title>Comet Position</Title>
        <Box>
          <Box>
            <SubTitle>Collateral</SubTitle>
            <Box sx={{ fontSize: '18px', fontWeight: '500' }}>
              {positionInfo.collAmount} USDi
            </Box>
            <Box sx={{ marginTop: '10px' }}>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Contributed USDi</DetailHeader>
                <DetailValue>{positionInfo.collAmount} USDi</DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Contributed iAsset</DetailHeader>
                <DetailValue>{positionInfo.mintAmount} iSOL</DetailValue>
              </Stack>
            </Box>
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>Price Range</SubTitle>
            <Box sx={{ marginTop: '20px' }}>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Center price</DetailHeader>
                <DetailValue>{positionInfo?.centerPrice.toFixed(2)} USD</DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Lower limit</DetailHeader>
                <DetailValue>{positionInfo?.lowerLimit.toFixed(2)} USD</DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Upper limit</DetailHeader>
                <DetailValue>{positionInfo?.upperLimit.toFixed(2)} USD</DetailValue>
              </Stack>
            </Box>
          </Box>
          <StyledDivider />

          {/* <Box>
            <SubTitle>ILD</SubTitle>
            <Box sx={{ fontSize: '18px', fontWeight: '500' }}>
              {positionInfo.ild} USDi
            </Box>
          </Box>
          <StyledDivider /> */}

          <ActionButton onClick={onRecenter}>Recenter</ActionButton>
        </Box>
      </Box>
    </Box>
  ) : <></>
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