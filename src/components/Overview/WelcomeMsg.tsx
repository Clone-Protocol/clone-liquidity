import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide';
import { styled, Typography } from '@mui/material'

const WelcomeMsg = () => {
	return (
		<Slide direction="down" in={true} mountOnEnter unmountOnExit>
			<StyledPaper variant="outlined">
				<Typography variant="p">Welcome to Incept Liquidity. Here is where anyone can be a liquidity provider (LP) of the Incept Trading Platform and earn trading fees and rewards.</Typography>
			</StyledPaper>
		</Slide>
	)
}

const StyledPaper = styled(Paper)`
	margin: 0 auto;
	max-width: 850px;
	text-align: center;
	background: ${(props) => props.theme.boxes.darkBlack};
	color: #bfbebe;
	padding-top: 8px;
	padding-bottom: 8px;
`

export default WelcomeMsg
