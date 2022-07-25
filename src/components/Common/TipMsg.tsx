import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide';
import { styled } from '@mui/material'

const TipMsg: React.FC = ({ children }: { children?: React.ReactNode }) => {
	return (
    <Slide direction="down" in={true} mountOnEnter unmountOnExit>
      <StyledPaper variant="outlined">{children}</StyledPaper>
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
	border-radius: 10px;
	background-color: rgba(21, 22, 24, 0.75);
	color: #989898;
	padding: 17px 37px 17px 46px;
`

export default TipMsg
