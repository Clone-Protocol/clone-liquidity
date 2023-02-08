import { styled, Typography, Box } from '@mui/material'
import Image from 'next/image'

const MultipoolBlank = ({ title, subtitle, icon }: { title: string, subtitle: string, icon: string }) => {
  return (
    <BoxWrapper>
      <Box><Typography variant="p">{title}</Typography></Box>
      <Box><Typography>{subtitle}</Typography></Box>
      <Box><Image src={icon} /></Box>
    </BoxWrapper>
  )
}

const BoxWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
	text-align: center;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
	color: #bfbebe;
	padding-top: 8px;
	padding-bottom: 8px;
`

export default MultipoolBlank
