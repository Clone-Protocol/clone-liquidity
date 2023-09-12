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
    color: #989898;
    font-weight: 600;
  }
`
export const RiskSubmitButton = styled(SubmitButton)`
  box-shadow: 0 0 10px 0 #c201a3;
  background-color: #d92a84;
  &:hover {
    background-color: #d92a84;
    opacity: 0.6;
  }
`

export const ConnectButton = styled(Button)`
  width: 100%;
  height: 52px;
  border-radius: 5px;
  box-shadow: 0 0 15px 0 #005874;
  border: solid 1px ${(props) => props.theme.basis.liquidityBlue};
  color: #fff;
  margin-top: 15px;
  margin-bottom: 15px;
  &:hover {
    background: transparent;
    border: solid 1px ${(props) => props.theme.basis.gloomyBlue};
  }
  &:disabled {
    border: 1px solid ${(props) => props.theme.basis.shadowGloom};
    font-weight: 600;
    color: #989898;
  }
`

export const SelectButton = styled(ConnectButton)`
  border: solid 1px ${(props) => props.theme.basis.shadowGloom};
  color: #989898;
  box-shadow: 0 0 0 0 #000;
`