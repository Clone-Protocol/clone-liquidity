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
				<BoxWrapper>
					<Box><Typography variant='p_lg'>{cometData.lowerLimit.toFixed(5)}</Typography></Box>
					<Box><Typography variant='p_sm' color='#989898'>onUSD / {assetData.tickerSymbol}</Typography></Box>
				</BoxWrapper>
			</Grid>
			<Grid item xs={4}>
				<Box textAlign='center'>
					<Typography variant='p_sm'>Center Price</Typography>
				</Box>
				<BoxWrapper>
					<Box><Typography variant='p_lg'>{assetData.price.toFixed(5)}</Typography></Box>
					<Box><Typography variant='p_sm' color='#989898'>onUSD / {assetData.tickerSymbol}</Typography></Box>
				</BoxWrapper>
			</Grid>
			<Grid item xs={4}>
				<Box textAlign='center'>
					<Typography variant='p_sm'>Upper Limit</Typography>
				</Box>
				<BoxWrapper>
					<Box><Typography variant='p_lg'>{cometData.upperLimit.toFixed(5)}</Typography></Box>
					<Box><Typography variant='p_sm' color='#989898'>onUSD / {assetData.tickerSymbol}</Typography></Box>
				</BoxWrapper>
			</Grid>
		</Grid>
	) : (
		<></>
	)
}

const BoxWrapper = styled(Box)`
	border: solid 1px ${(props) => props.theme.boxes.greyShade};
	padding: 7px 6px;
	text-align: center;
	line-height: 13px;
`
export default withCsrOnly(ConcentrationRangeBox)
