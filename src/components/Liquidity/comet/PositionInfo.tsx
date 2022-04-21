import { Box, Stack, Button, Divider } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { PositionInfo as PI, CometInfo } from '~/features/MyLiquidity/CometPosition.query'
import ConcentrationRangeView from '~/components/Liquidity/comet/ConcentrationRangeView'

interface Props {
	assetData: PI
	cometData: CometInfo
  mintAmount: number
	collateralAmount: number
}

const PositionInfo: React.FC<Props> = ({ assetData, cometData, mintAmount, collateralAmount, ild }) => {
	const onRecenter = () => {}

	return assetData ? (
    <Box sx={{ color: '#fff', padding: '25px 30px', marginTop: '15px' }}>
      <Title>Comet Position</Title>
      <Box sx={{ borderRadius: '10px', background: 'rgba(128, 156, 255, 0.08)', padding: '15px 20px'}}>
        <Box>
          <SubTitle>Collateral</SubTitle>
          <Box sx={{ fontSize: '14px', fontWeight: '500' }}>
            {collateralAmount} <span style={{ fontSize: '14px' }}>USDi</span>
          </Box>
          <Box sx={{ marginTop: '10px' }}>
            <Stack direction="row" justifyContent="space-between">
              <DetailHeader>Contributed USDi</DetailHeader>
              <DetailValue>
                {collateralAmount} USDi
              </DetailValue>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <DetailHeader>Contributed iAsset</DetailHeader>
              <DetailValue>
                {mintAmount} {assetData.tickerSymbol}
              </DetailValue>
            </Stack>
          </Box>
        </Box>
        <StyledDivider />

        <Box>
          <SubTitle>Price Range</SubTitle>
          <Box sx={{ marginTop: '20px' }}>
            <ConcentrationRangeView 
              assetData={assetData}
              cometData={cometData}
              max={assetData.maxRange}
            />
            <Stack direction="row" justifyContent="space-between">
              <DetailHeader>Center price</DetailHeader>
              <DetailValue>{assetData?.centerPrice.toFixed(2)} USDi</DetailValue>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <DetailHeader>Lower limit</DetailHeader>
              <DetailValue>
                {cometData.lowerLimit.toFixed(2)} USDi
              </DetailValue>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <DetailHeader>Upper limit</DetailHeader>
              <DetailValue>
                {cometData.upperLimit.toFixed(2)} USDi
              </DetailValue>
            </Stack>
          </Box>
        </Box>
      </Box>
      <StyledDivider />

      <Box sx={{ borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '17px 27px' }}>
        <SubTitle>ILD</SubTitle>
        <Box sx={{ fontSize: '14px', fontWeight: '500' }}>
          {ild} USDi
        </Box>
      </Box>
      <StyledDivider />

      <ActionButton onClick={onRecenter}>Recenter</ActionButton>
    </Box>
	) : (
		<></>
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
	color: #fff;
	margin-bottom: 20px;
`

const SubTitle = styled('div')`
	font-size: 12px;
	font-weight: 600;
	color: #989898;
  margin-bottom: 5px;
`

const DetailHeader = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
`

const DetailValue = styled('div')`
	font-size: 11px;
	font-weight: 500;
	color: #fff;
`

const ActionButton = styled(Button)`
	width: 100%;
	height: 45px;
  flex-grow: 0;
  border-radius: 10px;
  background-color: #4e609f;
  font-size: 13px;
  font-weight: 600;
	color: #fff;
`

export default withCsrOnly(PositionInfo)
