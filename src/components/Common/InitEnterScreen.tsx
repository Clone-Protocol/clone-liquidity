import React from 'react'
import { Box, styled, Typography, Button } from '@mui/material'
import useLocalStorage from '~/hooks/useLocalStorage'
import { IS_COMPLETE_INIT } from '~/data/localstorage'

const InitEnterScreen = ({ onClose }: { onClose: () => void }) => {
  const [_, setIsCompleteInit] = useLocalStorage(IS_COMPLETE_INIT, false)

  const close = () => {
    setIsCompleteInit(true)
    onClose && onClose()
  }

  return (
    <BackScreen>
      <BoxWrapper>
        <TextHead>Before you enter...</TextHead>
        <Box my='16px' lineHeight={0.9}>
          <Typography variant='p_lg'>
            Welcome to Clone Liquidity (Beta) on Solana Devnet. As the word “Beta” in the name suggests, you may find minor bugs in the interface. If you do, please report the issue to us on Discord or write an email to us at team@clone.so and we will address them ASAP. Thank you and congrats for being an early bird in Clone Ecosystem!
          </Typography>
        </Box>
        <EnterButton onClick={() => close()}><Typography variant='p'>Enter</Typography></EnterButton>
      </BoxWrapper>
    </BackScreen>
  )
}

const BackScreen = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
`
const BoxWrapper = styled(Box)`
  width: 600px;
  color: #fff; 
  text-align: left;
`
const TextHead = styled(Box)`
  font-size: 43px;
  font-weight: 600;
  background: ${(props) => props.theme.gradients.simple};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`
const EnterButton = styled(Button)`
  width: 100%;
  height: 48px;
  margin-top: 10px;
  color: #000;
  background-image: ${(props) => props.theme.gradients.simple};
`

export default InitEnterScreen

