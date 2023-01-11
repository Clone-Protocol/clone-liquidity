import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide';
import { styled } from '@mui/material'

const WelcomeMsg = () => {
	return (
    <Slide direction="down" in={true} mountOnEnter unmountOnExit>
      <StyledPaper variant="outlined">
        👋 Hi and welcome to Incept Liquidity. Here is where anyone can be a liquidity provider
        (LP) of the Incept Trading Platform and earn trading fees and rewards.
      </StyledPaper>
    </Slide>
	)
}

const StyledPaper = styled(Paper)`
	font-size: 12px;
	font-weight: 500;
	font-stretch: normal;
	font-style: normal;
	line-height: normal;
	letter-spacing: normal;
	text-align: center;
	background: rgba(21, 22, 24, 0.75);
	color: #bfbebe;
	padding: 17px 37px 17px 46px;
	border-radius: 8px;
`

export default WelcomeMsg
