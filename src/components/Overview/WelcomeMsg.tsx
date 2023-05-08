import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide';
import { styled, Typography } from '@mui/material'

const WelcomeMsg = () => {
	return (
		<Slide direction="down" in={true} mountOnEnter unmountOnExit>
			<StyledPaper variant="outlined">
				<Typography variant="p">Welcome to Incept Liquidity Beta on Solana Devnet! This is the perfect place to try out the Liquidity Provider (LP) experience on Incept Protocol at zero cost.</Typography>
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
