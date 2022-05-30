import { Box, Button, Divider } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { PositionInfo as PI } from '~/features/MyLiquidity/BorrowPosition.query'

interface Props {
	positionInfo: PI
  onShowEditForm: any
}

const PositionInfo: React.FC<Props> = ({ positionInfo, onShowEditForm }) => {
	return positionInfo ? (
		<Box sx={{ color: '#fff', padding: '25px 35px', marginTop: '15px' }}>
      <Title>Borrow Position</Title>
      <Box sx={{ borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08);'}}>
        <Box display="flex">
          <Box sx={{ padding: '22px', minWidth: '365px' }}>
            <SubTitle>Collateral Ratio</SubTitle>
            <Box sx={{ fontSize: '16px', fontWeight: '500' }}>
              {positionInfo.collateralRatio.toFixed(2)}% 
              <span style={{ fontSize: '12px', marginLeft: '5px' }}>(min: {positionInfo.minCollateralRatio.toFixed(2)}%)</span>
            </Box>

            <StyledDivider />

            <SubTitle>Collateral</SubTitle>
            <Box sx={{ fontSize: '12px', fontWeight: '500', marginBottom: '15px' }}>{positionInfo.collateralAmount} USDi</Box>

            <SubTitle>Borrowed</SubTitle>
            <Box sx={{ fontSize: '12px', fontWeight: '500' }}>
              {positionInfo.borrowedIasset.toFixed(2)} {positionInfo.tickerSymbol}
            </Box>
          </Box>
        </Box>
      </Box>

      <ActionButton onClick={onShowEditForm}>Edit</ActionButton>
		</Box>
	) : (
		<></>
	)
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 15px;
	margin-top: 15px;
  width: 345px;
	height: 1px;
`

const Title = styled('div')`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
  margin-left: 10px;
`

const SubTitle = styled('div')`
  font-size: 12px;
  font-weight: 600;
  color: #989898;
  margin-bottom: 5px;
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
  margin-top: 33px;
  margin-bottom: 6px;
`

export default withCsrOnly(PositionInfo)
