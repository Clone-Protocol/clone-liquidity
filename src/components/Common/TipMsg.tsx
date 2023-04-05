import Slide from '@mui/material/Slide';
import { styled, Box } from '@mui/material'

const TipMsg: React.FC = ({ children }: { children?: React.ReactNode }) => {
	return (
		<Slide direction="down" in={true} mountOnEnter unmountOnExit>
			<StyledBox>{children}</StyledBox>
		</Slide>
	)
}

const StyledBox = styled(Box)`
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 12px;
	font-weight: 500;
	text-align: center;
	background-color: ${(props) => props.theme.boxes.darkBlack};
	color: ${(props) => props.theme.palette.text.secondary};
	height: 38px;
`

export default TipMsg
