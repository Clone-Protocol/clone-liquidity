import { Box, Stack, Button, Divider } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { PositionInfo as PI, CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import ConcentrationRangeView from '~/components/Liquidity/comet/ConcentrationRangeView'
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';

interface Props {
	assetData: PI
	cometDetail: CometDetail
  onShowEditForm: any
  onRecenter: any
}

const PositionInfo: React.FC<Props> = ({ assetData, cometDetail, onShowEditForm, onRecenter }) => {
  const cometData = {
    isTight: false,
    collRatio: 50,
    lowerLimit: cometDetail.lowerLimit,
    upperLimit: cometDetail.upperLimit
  }

	return assetData ? (
    <Box sx={{ color: '#fff', padding: '25px 30px', marginTop: '15px' }}>
      <Title>Comet Position</Title>
      <Box sx={{ borderRadius: '10px', background: 'rgba(128, 156, 255, 0.08)'}}>
        <Box display="flex">
          <Box sx={{ padding: '22px', minWidth: '365px' }}>
            <SubTitle>Collateral</SubTitle>
            <Box sx={{ fontSize: '14px', fontWeight: '500' }}>
              {cometDetail.collAmount.toLocaleString()} <span style={{ fontSize: '14px' }}>USDi</span>
            </Box>
            <Box sx={{ marginTop: '10px' }}>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Contributed USDi</DetailHeader>
                <DetailValue>
                  {cometDetail.collAmount.toLocaleString()} USDi
                </DetailValue>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <DetailHeader>Contributed iAsset</DetailHeader>
                <DetailValue>
                  {cometDetail.mintAmount.toLocaleString()} {assetData.tickerSymbol}
                </DetailValue>
              </Stack>
            </Box>
            <StyledDivider />
          
            <SubTitle>Price Range</SubTitle>
            <Box sx={{ marginTop: '20px' }}>
              <ConcentrationRangeView
                centerPrice={assetData.price}
                lowerLimit={cometData.lowerLimit}
                upperLimit={cometData.upperLimit}
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
          <EditBox onClick={onShowEditForm}>
            <NoteAltOutlinedIcon fontSize="small" />
          </EditBox>
        </Box>
      </Box>
      <StyledDivider />

      <Box sx={{ display: 'flex', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '13px 27px' }}>
        <Box sx={{ width: '45%', marginLeft: '15px' }}>
          <SubTitle>Health Score</SubTitle>
          <Box sx={{ fontSize: '18px', fontWeight: '500' }}>
            {cometDetail.healthScore.toFixed(2)}/100
          </Box>
        </Box>
        <Box sx={{ display: 'flex', width: '50%' }}>
          <div style={{ background: '#535353', width: '1px', height: '56px'}}></div>
          <Box sx={{ marginLeft: '35px' }}>
            <SubTitle>ILD</SubTitle>
            <Box sx={{ fontSize: '14px', fontWeight: '500', marginTop: '10px' }}>
              {cometDetail.ild.toFixed(2)} USDi
            </Box>
          </Box>
        </Box>
      </Box>
      <StyledDivider />

      <ActionButton onClick={onRecenter} disabled={cometDetail.collAmount == 0}>Recenter</ActionButton>
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
	font-size: 16px;
	font-weight: 600;
	color: #fff;
	margin-bottom: 10px;
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

const EditBox = styled(Box)`
  width: 41px;
  background-color: rgba(128, 156, 255, 0.2);
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
  &:hover {
    background-color: #7A86B6;
  }
`

export default withCsrOnly(PositionInfo)
