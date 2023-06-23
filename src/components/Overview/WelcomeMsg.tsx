import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide';
import { styled, Typography } from '@mui/material'

const WelcomeMsg = () => {
	return (
		<Slide direction="down" in={true} mountOnEnter unmountOnExit>
			<StyledPaper variant="outlined">
				<Typography variant="p">Welcome to Clone Liquidity Beta App on Solana Devnet! This is the perfect place to try out the LP experience on Clone.</Typography>
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
