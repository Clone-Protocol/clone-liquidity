import Slide from '@mui/material/Slide';
import { styled, Typography, Stack, Box, Alert } from '@mui/material'

const TempWarningMsg: React.FC = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <WarningStack severity="error">
        <Box ml='10px'><Typography variant='p'>{children}</Typography></Box>
      </WarningStack>
    </Slide>
  )
}

const WarningStack = styled(Alert)`
  position: fixed;
  top: 10px;
  left: 250px;
  z-index: 9999999;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
	line-height: 0.9;
	padding: 10px;
  background-color: ${(props) => props.theme.boxes.darkBlack};
	color: ${(props) => props.theme.palette.text.secondary};
  border: 1px solid ${(props) => props.theme.palette.error.main};
`

export default TempWarningMsg
