import { styled } from '@mui/system'
import { Button } from '@mui/material'

export const RiskButton = styled(Button)`
width: 84px;
height: 33px;
margin: 6px;
border-radius: 8px;
border: solid 1px #ff2929;
color: #FFF;
font-size: 12px;
font-weight: 600;
`

export const StableButton = styled(Button)`
width: 84px;
height: 33px;
margin: 6px;
border-radius: 8px;
border-style: solid;
border-width: 1px;
border-image-source: linear-gradient(91deg, #00f0ff 0%, #0038ff 109%);
border-image-slice: 1;
color: #FFF;
font-size: 12px;
font-weight: 600;
`

export const InactiveButton = styled(Button)`
width: 84px;
height: 33px;
margin: 6px;
border-radius: 8px;
border: solid 1px #989898;
color: #989898;
font-size: 12px;
font-weight: 600;
`