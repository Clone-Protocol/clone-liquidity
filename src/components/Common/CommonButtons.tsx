import { styled } from '@mui/system'
import { Box, Button } from '@mui/material'

export const GoBackButton = styled(Box)`
  color: ${(props) => props.theme.basis.slug};
  cursor: pointer;
  &:hover {
    color: #fff;
  }
`

export const SubmitButton = styled(Button)`
	width: 100%;
	background-color: ${(props) => props.theme.palette.primary.main};
	color: #000;
  border-radius: 0px;
  margin-top: 15px;
	margin-bottom: 15px;
  &:hover {
    background-color: ${(props) => props.theme.palette.hover};
  }
  &:disabled {
    background-color: ${(props) => props.theme.boxes.grey};
    color: #000;
  }
`