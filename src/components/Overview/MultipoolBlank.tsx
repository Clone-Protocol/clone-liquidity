import { styled, Typography, Box } from '@mui/material'
import Image from 'next/image'

const MultipoolBlank = ({ title, subtitle, icon }: { title: string, subtitle: string, icon?: string }) => {
  return (
    <BoxWrapper>
      <Box><Typography variant="p">{title}</Typography></Box>
      <Box maxWidth='414px'><Typography variant="p" color="#989898">{subtitle}</Typography></Box>
      {icon && <Box my="20px"><Image src={icon} /></Box>}
    </BoxWrapper>
  )
}

const BoxWrapper = styled(Box)`
  height: 173px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 16px;
	text-align: center;  
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
	color: #bfbebe;
	padding-top: 8px;
	padding-bottom: 8px;
`

export default MultipoolBlank
