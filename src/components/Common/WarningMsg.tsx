import Slide from '@mui/material/Slide';
import { styled, Typography, Stack, Box } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const WarningMsg: React.FC = ({ children }: { children?: React.ReactNode }) => {
	return (
		<Slide direction="up" in={true} mountOnEnter unmountOnExit>
			<WarningStack direction='row'>
				<WarningAmberIcon sx={{ color: '#ed2525', width: '15px' }} />
				<Box ml='10px'><Typography variant='p'>{children}</Typography></Box>
			</WarningStack>
		</Slide>
	)
}

const WarningStack = styled(Stack)`
  justify-content: center;
  align-items: center;
  margin-top: 10px;
	line-height: 0.9;
	padding: 5px;
  border: 1px solid ${(props) => props.theme.palette.error.main};
  color: ${(props) => props.theme.palette.text.secondary};
`

export default WarningMsg
