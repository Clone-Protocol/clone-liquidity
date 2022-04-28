import { Box, Grid } from '@mui/material'
import { styled } from '@mui/system'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { PositionInfo as PI, CometInfo } from '~/features/MyLiquidity/CometPosition.query'

interface Props {
  assetData: PI
	cometData: CometInfo
}

const EditConcentrationRangeBox: React.FC<Props> = ({ assetData, cometData }) => {
	return cometData ? (
		<Grid container spacing={2}>
			<Grid item xs={4}>
				<Box
					sx={{
						fontSize: '12px',
						fontWeight: '500',
						color: '#809cff',
						textAlign: 'center',
						marginBottom: '5px',
					}}>
					Lower Limit
				</Box>
				<Box
					sx={{
						borderRadius: '10px',
						border: 'solid 1px #809cff',
					}}>
					<PriceValue>{cometData.lowerLimit.toFixed(2)}</PriceValue>
					<RangePair>USDi / {assetData.tickerSymbol}</RangePair>
          <CurrentPrice style={{ borderTop: '1px solid #809cff'}}><span style={{ fontSize: '9px' }}>Current:</span> 90.12 USD</CurrentPrice>
				</Box>
			</Grid>
			<Grid item xs={4}>
				<Box
					sx={{
						fontSize: '12px',
						fontWeight: '500',
						color: '#FFF',
						textAlign: 'center',
						marginBottom: '5px',
					}}>
					Center Price
				</Box>
				<Box sx={{ borderRadius: '10px', border: 'solid 1px #444'}}>
					<PriceValue style={{ background: '#171717' }}>{assetData.price.toFixed(2)}</PriceValue>
					<RangePair>USDi / {assetData.tickerSymbol}</RangePair>
          <CurrentPrice style={{ borderTop: '1px solid #444'}}><span style={{ fontSize: '9px' }}>Current:</span> 100.58 USD</CurrentPrice>
				</Box>
			</Grid>
			<Grid item xs={4}>
				<Box
					sx={{
						fontSize: '12px',
						fontWeight: '500',
						color: '#0038ff',
						textAlign: 'center',
						marginBottom: '5px',
					}}>
					Upper Limit
				</Box>
				<Box
					sx={{
						borderRadius: '10px',
						border: 'solid 1px #0038ff',
					}}>
					<PriceValue>{cometData.upperLimit.toFixed(2)}</PriceValue>
					<RangePair>USDi / {assetData.tickerSymbol}</RangePair>
          <CurrentPrice style={{ borderTop: '1px solid #0038ff'}}><span style={{ fontSize: '9px' }}>Current:</span> 120.66 USD</CurrentPrice>
				</Box>
			</Grid>
		</Grid>
	) : (
		<></>
	)
}

const PriceValue = styled('div')`
  background: #333333;
	font-size: 16px;
	font-weight: 500;
	text-align: center;
  padding-top: 8px;
  padding-bottom: 8px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`

const RangePair = styled('div')`
  background: #171717;
  border-top: 1px solid #444;
	font-size: 12px;
	font-weight: 500;
	padding-top: 8px;
  padding-bottom: 8px;
	text-align: center;
  color: #9a9a9a;
`

const CurrentPrice = styled('div')`
  font-size: 12px;
  font-weight: 500;
  padding-top: 6px;
  padding-bottom: 6px;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #949494;
`

export default withCsrOnly(EditConcentrationRangeBox)
