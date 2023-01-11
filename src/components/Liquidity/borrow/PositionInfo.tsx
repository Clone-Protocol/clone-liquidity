import { Box } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { PositionInfo as PI } from '~/features/MyLiquidity/BorrowPosition.query'
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import InfoTooltip from '~/components/Common/InfoTooltip';
import { TooltipTexts } from '~/data/tooltipTexts';

interface Props {
  positionInfo: PI
  onShowEditForm: () => void
  onShowBorrowMore: () => void
}

const PositionInfo: React.FC<Props> = ({ positionInfo, onShowEditForm, onShowBorrowMore }) => {
  return positionInfo ? (
    <PositionWrapper>
      <Title>Borrow Position</Title>
      <Box>
        <CollRatioBox>
          <SubTitle>Collateral Ratio <InfoTooltip title={TooltipTexts.collateralRatio} /></SubTitle>
          {positionInfo.borrowedIasset > 0 ?
            <Box>
              {positionInfo.collateralRatio.toFixed(2)}%
              <MinText>(min: {positionInfo.minCollateralRatio.toFixed(2)}%)</MinText>
            </Box>
            :
            <Box>-</Box>
          }
        </CollRatioBox>

        <EditRowBox>
          <InfoBox>
            <SubTitle>Collateral <InfoTooltip title={TooltipTexts.collateralBacking} /></SubTitle>
            <SubValue>{positionInfo.collateralAmount.toLocaleString(undefined, { maximumFractionDigits: 5 })} USDi</SubValue>
          </InfoBox>
          <EditBox onClick={onShowEditForm}>
            <NoteAltOutlinedIcon fontSize="small" />
          </EditBox>
        </EditRowBox>

        <EditRowBox>
          <InfoBox>
            <SubTitle>Borrowed <InfoTooltip title={TooltipTexts.borrowed} /></SubTitle>
            <SubValue>
              {positionInfo.borrowedIasset.toLocaleString(undefined, { maximumFractionDigits: 5 })} {positionInfo.tickerSymbol}
            </SubValue>
          </InfoBox>
          <EditBox onClick={onShowBorrowMore}>
            <NoteAltOutlinedIcon fontSize="small" />
          </EditBox>
        </EditRowBox>
      </Box>
    </PositionWrapper>
  ) : (
    <></>
  )
}

const PositionWrapper = styled(Box)`
  color: #fff; 
  padding: 25px 35px; 
  margin-top: 15px;
`

const CollRatioBox = styled(Box)`
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  padding: 27px; 
  width: 400px; 
  height: 65px; 
  background-color: rgba(255, 255, 255, 0.08); 
  border-radius: 10px; 
  margin-top: 18px; 
  margin-bottom: 9px;
  font-size: 16px;
  font-weight: 500;
`

const EditRowBox = styled(Box)`
  display: inline-flex; 
  width: 400px; 
  height: 69px; 
  background-color: rgba(128, 156, 255, 0.08); 
  border-radius: 10px; 
  margin-bottom: 9px;
`

const InfoBox = styled(Box)`
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  padding: 27px;
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

const SubValue = styled(Box)`
  font-size: 12px; 
  font-weight: 500;
`

const MinText = styled('span')`
  font-size: 12px; 
  margin-left: 5px;
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
