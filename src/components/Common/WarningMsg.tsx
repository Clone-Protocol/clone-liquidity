import Slide from '@mui/material/Slide';
import { styled, Typography, Stack } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const WarningMsg: React.FC = ({ children }: { children?: React.ReactNode }) => {
	return (
		<Slide direction="down" in={true} mountOnEnter unmountOnExit>
			<WarningStack direction='row'>
				<WarningAmberIcon sx={{ color: '#ed2525', width: '15px' }} />
				<Typography variant='p' ml='8px'>{children}</Typography>
			</WarningStack>
		</Slide>
	)
}

const WarningStack = styled(Stack)`
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
  border: 1px solid ${(props) => props.theme.palette.error.main};
  color: ${(props) => props.theme.palette.text.secondary};
`

export default WarningMsg
