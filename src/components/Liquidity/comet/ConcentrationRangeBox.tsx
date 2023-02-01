import { Box, Grid, Divider, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { PositionInfo as PI, CometInfo } from '~/features/MyLiquidity/CometPosition.query'

interface Props {
	assetData: PI
	cometData: CometInfo
}

const ConcentrationRangeBox: React.FC<Props> = ({ assetData, cometData }) => {
	return cometData ? (
		<Grid container spacing={2}>
			<Grid item xs={4}>
				<Box textAlign='center'>
					<Typography variant='p_sm'>Lower Limit</Typography>
				</Box>
				<Box
					sx={{
						background: '#171717',
						borderRadius: '10px',
						border: 'solid 1px #809cff',
						paddingTop: '8px',
						paddingBottom: '8px'
					}}>
					<Box textAlign='center'><Typography variant='p_lg'>{cometData.lowerLimit.toFixed(5)}</Typography></Box>
					<Box textAlign='center'><Typography variant='p_sm' color='#989898'>USD / {assetData.tickerSymbol}</Typography></Box>
				</Box>
			</Grid>
			<Grid item xs={4}>
				<Box textAlign='center'>
					<Typography variant='p_sm'>Center Price</Typography>
				</Box>
				<Box sx={{
					borderRadius: '10px', border: 'solid 1px #FFF', paddingTop: '8px',
					paddingBottom: '8px'
				}}>
					<Box textAlign='center'><Typography variant='p_lg'>{assetData.price.toFixed(5)}</Typography></Box>
					<Box textAlign='center'><Typography variant='p_sm' color='#989898'>USDi / {assetData.tickerSymbol}</Typography></Box>
				</Box>
			</Grid>
			<Grid item xs={4}>
				<Box textAlign='center'>
					<Typography variant='p_sm'>Upper Limit</Typography>
				</Box>
				<Box
					sx={{
						background: '#171717',
						borderRadius: '10px',
						border: 'solid 1px #0038ff',
						paddingTop: '8px',
						paddingBottom: '8px'
					}}>
					<Box textAlign='center'><Typography variant='p_lg'>{cometData.upperLimit.toFixed(5)}</Typography></Box>
					<Box textAlign='center'><Typography variant='p_sm' color='#989898'>USDi / {assetData.tickerSymbol}</Typography></Box>
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
