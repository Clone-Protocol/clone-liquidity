import { Box, Grid, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { PositionInfo as PI, CometInfo } from '~/features/MyLiquidity/CometPosition.query'

interface Props {
	assetData: PI
	cometData: CometInfo
	currentLowerLimit: number
	currentUpperLimit: number
}

const EditConcentrationRangeBox: React.FC<Props> = ({ assetData, cometData, currentLowerLimit, currentUpperLimit }) => {
	return cometData ? (
		<Grid container spacing={1}>
			<Grid item xs={4}>
				<Box textAlign='center'>
					<Typography variant='p_sm'>Lower Limit</Typography>
				</Box>
				<BoxWithBorder>
					<LimitBox>
						<Box><Typography variant='p_lg'>{parseFloat(cometData.lowerLimit.toFixed(4))}</Typography></Box>
						<Box><Typography variant='p_sm' color='#989898'>USDi / {assetData.tickerSymbol}</Typography></Box>
					</LimitBox>
					<CurrentBox>
						<Box><Typography variant='p_sm'>Current</Typography></Box>
						<Box><Typography variant='p'>{currentLowerLimit.toLocaleString()} USDi</Typography></Box>
					</CurrentBox>
				</BoxWithBorder>
			</Grid>
			<Grid item xs={4}>
				<Box textAlign='center'>
					<Typography variant='p_sm'>Center Price</Typography>
				</Box>
				<BoxWithBorder>
					<LimitBox>
						<Box><Typography variant='p_lg'>{assetData.price.toLocaleString()}</Typography></Box>
						<Box><Typography variant='p_sm' color='#989898'>USDi / {assetData.tickerSymbol}</Typography></Box>
					</LimitBox>
					<CurrentBox>
						<Box><Typography variant='p_sm'>Current</Typography></Box>
						<Box><Typography variant='p'>{assetData.price.toLocaleString()} USDi</Typography></Box>
					</CurrentBox>
				</BoxWithBorder>
			</Grid>
			<Grid item xs={4}>
				<Box textAlign='center'>
					<Typography variant='p_sm'>Upper Limit</Typography>
				</Box>
				<BoxWithBorder>
					<LimitBox>
						<Box><Typography variant='p_lg'>{parseFloat(cometData.upperLimit.toFixed(4))}</Typography></Box>
						<Box><Typography variant='p_sm' color='#989898'>USDi / {assetData.tickerSymbol}</Typography></Box>
					</LimitBox>
					<CurrentBox>
						<Box><Typography variant='p_sm'>Current</Typography></Box>
						<Box><Typography variant='p'>{currentUpperLimit.toLocaleString()} USDi</Typography></Box>
					</CurrentBox>
				</BoxWithBorder>
			</Grid>
		</Grid>
	) : (
		<></>
	)
}

const BoxWithBorder = styled(Box)`
	border: solid 1px ${(props) => props.theme.boxes.blackShade};
`
const LimitBox = styled(Box)`
	text-align: center;
	line-height: 1;
	padding: 8px;
`
const CurrentBox = styled(Box)`
	text-align: center;
	border-top: 1px solid ${(props) => props.theme.boxes.blackShade};
	color: ${(props) => props.theme.palette.text.secondary};
	line-height: 1;
	padding: 8px;
`

export default withCsrOnly(EditConcentrationRangeBox)
