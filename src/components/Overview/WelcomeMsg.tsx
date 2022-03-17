import Paper from '@mui/material/Paper'
import { styled } from '@mui/material'

const WelcomeMsg = () => {
	const boldStyle = {
		textDecoration: 'underline',
		color: '#000',
	}
	return (
		<StyledPaper variant="outlined">
			👋 Hi and welcome to <BoldText>Incept Liquidity</BoldText>. Here is where anyone can be a liquidity provider
			(LP) of the <BoldText>Incept Trading Platform</BoldText> and earn trading fees and rewards.
		</StyledPaper>
	)
}

const StyledPaper = styled(Paper)`
	font-size: 14px;
	font-weight: 500;
	font-stretch: normal;
	font-style: normal;
	line-height: normal;
	letter-spacing: normal;
	text-align: center;
	background: #171717;
	color: #606060;
	padding: 17px 37px 17px 46px;
	border-radius: 8px;
`

const BoldText = styled('span')`
	color: #fff;
`

export default WelcomeMsg
