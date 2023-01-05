import { Box } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { PositionInfo as PI } from '~/features/MyLiquidity/BorrowPosition.query'
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import InfoTooltip from '~/components/Common/InfoTooltip';

interface Props {
	positionInfo: PI
  onShowEditForm: () => void
  onShowBorrowMore: () => void
}

const PositionInfo: React.FC<Props> = ({ positionInfo, onShowEditForm, onShowBorrowMore }) => {
  const collateralRatioTooltipText = `Designates the ratio in terms of value of the collateral and the borrowed iAsset. For example, if you borrow $100 of iSOL with 200 USDi, then the collateral ratio is 200%. 
  A borrow position is subject to liquidation if the ratio falls below 150%, but we recommend opening a position with a safer ratio of atleast 250%.`
  
  const collateralTooltipText = `The amount of collateral backing your borrow position.`
  const borrowedTooltipText = `The amount of iAsset borrowed, also referred to as the your debt.`

	return positionInfo ? (
		<Box sx={{ color: '#fff', padding: '25px 35px', marginTop: '15px' }}>
      <Title>Borrow Position</Title>
      <Box sx={{ borderRadius: '10px', background: 'rgba(21, 22, 24, 0.75)'}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '27px', width: '400px', height: '65px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', marginTop: '18px', marginBottom: '9px' }}>
          <SubTitle>Collateral Ratio <InfoTooltip title={collateralRatioTooltipText} /></SubTitle>
          { positionInfo.borrowedIasset > 0 ?
            <Box sx={{ fontSize: '16px', fontWeight: '500' }}>
              {positionInfo.collateralRatio.toFixed(2)}% 
              <span style={{ fontSize: '12px', marginLeft: '5px' }}>(min: {positionInfo.minCollateralRatio.toFixed(2)}%)</span>
            </Box>
            :
            <Box sx={{ fontSize: '16px', fontWeight: '500' }}>-</Box>
          }
        </Box>

        <EditRowBox>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '27px' }}>
            <SubTitle>Collateral <InfoTooltip title={collateralTooltipText} /></SubTitle>
            <Box sx={{ fontSize: '12px', fontWeight: '500' }}>{positionInfo.collateralAmount.toLocaleString(undefined, { maximumFractionDigits: 5 })} USDi</Box>
          </Box>
          <EditBox onClick={onShowEditForm}>
            <NoteAltOutlinedIcon fontSize="small" />
          </EditBox>
        </EditRowBox>

        <EditRowBox>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '27px' }}>
            <SubTitle>Borrowed <InfoTooltip title={borrowedTooltipText} /></SubTitle>
            <Box sx={{ fontSize: '12px', fontWeight: '500' }}>
              {positionInfo.borrowedIasset.toLocaleString(undefined, { maximumFractionDigits: 5 })} {positionInfo.tickerSymbol}
            </Box>
          </Box>
          <EditBox onClick={onShowBorrowMore}>
            <NoteAltOutlinedIcon fontSize="small" />
          </EditBox>
        </EditRowBox>
      </Box>
		</Box>
	) : (
		<></>
	)
}

const EditRowBox = styled(Box)`
  display: inline-flex; 
  width: 400px; 
  height: 69px; 
  background-color: rgba(128, 156, 255, 0.08); 
  border-radius: 10px; 
  margin-bottom: 9px;
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
`

const EditBox = styled(Box)`
  position: relative; 
  margin-left: auto; 
  right: 0;
  width: 41px;
  background-color: rgba(128, 156, 255, 0.2);
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

export default withCsrOnly(PositionInfo)
