import { Box, Grid, Divider } from '@mui/material'
import { styled } from '@mui/system'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { PositionInfo as PI, CometInfo } from '~/features/MyLiquidity/CometPosition.query'
import InfoTooltip from '~/components/Common/InfoTooltip'

interface Props {
  assetData: PI
	cometData: CometInfo
}

const ConcentrationRangeBox: React.FC<Props> = ({ assetData, cometData }) => {
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
					Lower Limit <InfoTooltip title="Lower Limit" />
				</Box>
				<Box
					sx={{
						background: '#171717',
						borderRadius: '10px',
						border: 'solid 1px #809cff',
						paddingTop: '8px',
            paddingBottom: '8px'
					}}>
					<PriceValue>{cometData.lowerLimit.toFixed(5)}</PriceValue>
          <StyledDivider />
					<RangePair>USD / {assetData.tickerSymbol}</RangePair>
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
					Center Price <InfoTooltip title="Center Price" />
				</Box>
				<Box sx={{ borderRadius: '10px', border: 'solid 1px #FFF', paddingTop: '8px',
            paddingBottom: '8px' }}>
					<PriceValue>{assetData.price.toFixed(5)}</PriceValue>
          <StyledDivider />
					<RangePair>USDi / {assetData.tickerSymbol}</RangePair>
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
					Upper Limit <InfoTooltip title="Upper Limit" />
				</Box>
				<Box
					sx={{
						background: '#171717',
						borderRadius: '10px',
						border: 'solid 1px #0038ff',
						paddingTop: '8px',
            paddingBottom: '8px'
					}}>
					<PriceValue>{cometData.upperLimit.toFixed(5)}</PriceValue>
          <StyledDivider />
					<RangePair>USDi / {assetData.tickerSymbol}</RangePair>
				</Box>
			</Grid>
		</Grid>
	) : (
		<></>
	)
}

const PriceValue = styled('div')`
	font-size: 16px;
	font-weight: 500;
	text-align: center;
`

const StyledDivider = styled(Divider)`
	background-color: #444;
	height: 1px;
  margin-top: 2px;
`

const RangePair = styled('div')`
	font-size: 12px;
	font-weight: 500;
	padding-top: 8px;
	text-align: center;
  color: #5c5c5c;
`

export default withCsrOnly(ConcentrationRangeBox)
