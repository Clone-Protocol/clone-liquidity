import { styled } from '@mui/system'
import { Button } from '@mui/material'

export const RiskButton = styled(Button)`
	width: 84px;
	height: 33px;
	margin: 6px;
	border-radius: 8px;
	border: solid 1px #ff2929;
	color: #fff;
	font-size: 12px;
	font-weight: 600;
`

export const StableButton = styled(Button)`
	width: 80px;
	height: 26px;
	margin: 4px;
  padding: 0;
	border-radius: 10px;
	border: 1px solid transparent;
  background-image: linear-gradient(#000000, #000000), linear-gradient(to bottom, #809cff 0%, #0038ff 100%);
  background-clip: content-box, border-box;
  background-origin: border-box;
	color: #fff;
	font-size: 10px;
  font-weight: 500;
	&:disabled {
    background-color: #444;
    color: #adadad;
  }
`

export const InactiveButton = styled(Button)`
	width: 84px;
	height: 33px;
	margin: 6px;
	border-radius: 10px;
	border: solid 1px #989898;
	color: #989898;
	font-size: 12px;
	font-weight: 600;
`

export const DefaultButton = styled(Button)`
  width: 80px;
  height: 26px;
  border-radius: 10px;
  border: solid 1px #535353;
  background-color: #000;
  font-size: 10px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #fff;
  margin: 4px;
`