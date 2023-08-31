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
        <TextHead>Welcome!</TextHead>
        <Box my='20px' lineHeight={0.9}>
          <Typography variant='p_xlg' lineHeight={1.5}>
            Welcome to Clone Liquidity (Beta) on Solana Devnet. As the word “Beta” in the name suggests, you may find minor bugs in the interface. If you do, please report the issue to us on Discord or write an email to us at team@clone.so and we will address them ASAP. Thank you and congrats for being an early bird in Clone Ecosystem!
          </Typography>
        </Box>
        <EnterButton onClick={() => close()}><Typography variant='p_xlg'>Enter Clone Devnet</Typography></EnterButton>
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
  width: 500px;
  color: #fff; 
  text-align: left;
`
const TextHead = styled(Box)`
  font-size: 36px;
  font-weight: 600;
  color: ${(props) => props.theme.basis.skylight};
`
const EnterButton = styled(Button)`
  width: 100%;
  height: 52px;
  color: #000;
  margin-top: 10px;
  background: ${(props) => props.theme.basis.liquidityBlue};
  &:hover {
    background: ${(props) => props.theme.basis.gloomyBlue};
  }
`

export default InitEnterScreen

