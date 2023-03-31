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
	max-width: 1060px;
	text-align: center;
	background: ${(props) => props.theme.boxes.darkBlack};
	color: #bfbebe;
	padding: 8px 15px;
`

export default WelcomeMsg
