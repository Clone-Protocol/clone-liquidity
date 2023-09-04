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
  height: 52px;
	background-color: ${(props) => props.theme.palette.primary.main};
	color: #000;
  border-radius: 5px;
  margin-top: 15px;
	margin-bottom: 15px;
  &:hover {
    background-color: ${(props) => props.theme.basis.gloomyBlue};
  }
  &:disabled {
    border: 1px solid ${(props) => props.theme.basis.shadowGloom};
    font-weight: 600;
    color: #989898;
  }
`

export const ConnectButton = styled(Button)`
  width: 100%;
  height: 52px;
  background-color: ${(props) => props.theme.palette.primary.main};
  color: #000;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 15px;
  &:hover {
    background-color: ${(props) => props.theme.basis.gloomyBlue};
  }
  &:disabled {
    border: 1px solid ${(props) => props.theme.basis.shadowGloom};
    font-weight: 600;
    color: #989898;
  }
`