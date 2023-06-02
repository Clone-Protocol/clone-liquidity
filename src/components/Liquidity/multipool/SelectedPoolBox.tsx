import { styled, Box } from '@mui/material'
import InfoTooltip from '~/components/Common/InfoTooltip'
import Image from 'next/image'
import { PositionInfo } from '~/features/MyLiquidity/multipool/LiquidityPosition.query'
import { TooltipTexts } from '~/data/tooltipTexts'

interface Props {
  positionInfo: PositionInfo
}

const SelectedPoolBox: React.FC<Props> = ({ positionInfo }) => {
  return (
    <Box>
      <Box>
        <SubTitle>Selected liquidity pool:</SubTitle>
        <PairBox>
          <Image src={positionInfo.tickerIcon} width="28px" height="28px" />
          <Box sx={{ marginLeft: '9px' }}>
            <span style={{ fontSize: '18px' }}>{positionInfo.tickerSymbol}</span> / onUSD
          </Box>
        </PairBox>
      </Box>
      <DetailBox>
        <SubTitle>Total collateral value <InfoTooltip title={TooltipTexts.totalValueMultipoolComet} /></SubTitle>
        <div style={{ marginBottom: '15px' }}>${positionInfo.totalCollValue.toLocaleString()}</div>

        <SubTitle>Mulipool Comet Health Score <InfoTooltip title={TooltipTexts.multipoolCometdHealthScore} /></SubTitle>
        <div style={{ textAlign: 'center' }}><span style={{ fontSize: '20px' }}>{positionInfo.totalHealthScore.toFixed(2)}</span>/100</div>
      </DetailBox>
    </Box>
  )
}

const PairBox = styled(Box)`
  width: 250px;
  height: 63px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  border: 1px solid transparent;
  border-image-slice: 1;
  background-image: linear-gradient(to bottom, #2d2d2d, #2d2d2d), linear-gradient(to bottom, #8c73ac 0%, #7d17ff 100%);
  background-origin: border-box;
  background-clip: content-box, border-box;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-top: 7px;
`

const SubTitle = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
`

const DetailBox = styled(Box)`
  width: 250px;
  padding: 14px 20px;
  border-radius: 10px;
  border: solid 1px #323232;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  margin-top: 25px;
`

export default SelectedPoolBox