import Paper from '@mui/material/Paper'
import { styled } from '@mui/material'

const TipMsg: React.FC = ({ children }: { children?: React.ReactNode }) => {
	return <StyledPaper variant="outlined">{children}</StyledPaper>
}

const StyledPaper = styled(Paper)`
	font-size: 14px;
	font-weight: 500;
	font-stretch: normal;
	font-style: normal;
	line-height: normal;
	letter-spacing: normal;
	text-align: center;
	border-radius: 10px;
	background-color: #171717;
	color: #989898;
	padding: 17px 37px 17px 46px;
`

export default TipMsg
