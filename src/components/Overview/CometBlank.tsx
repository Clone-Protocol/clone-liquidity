import { styled, Typography, Box } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const CometBlank = ({ title, subtitle, icon, hoverIcon }: { title: string, subtitle: string, icon?: string, hoverIcon?: string }) => {
  const [isBtnHover, setIsBtnHover] = useState(false)

  return (
    <BoxWrapper>
      <Box><Typography variant="p">{title}</Typography></Box>
      <Box maxWidth='414px' mx='5px'><Typography variant="p" color="#989898">{subtitle}</Typography></Box>
      {icon && hoverIcon && <Link href='/liquidity'><IndicatorBox my="20px" onMouseOver={() => setIsBtnHover(true)} onMouseLeave={() => setIsBtnHover(false)}><Image src={isBtnHover ? hoverIcon : icon} alt={'icon'} /></IndicatorBox></Link>}
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
	padding-top: 16px;
	padding-bottom: 8px;
`
const IndicatorBox = styled(Box)`
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: ${(props) => props.theme.boxes.darkBlack};
  border-radius: 50%;
`

export default CometBlank
