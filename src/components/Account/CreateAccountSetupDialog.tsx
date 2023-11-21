import React from 'react'
import { Box, styled, Typography, Button, Dialog } from '@mui/material'
import { CreateAccountDialogStates, NETWORK_NAME } from '~/utils/constants'
import { CloseButton } from '../Common/CommonButtons'
import { useAtomValue } from 'jotai'
import { isCreatingAccountState } from '~/features/globalAtom'
import BgDialog from 'public/images/open-account.png'

interface CreateAccountSetupScreenProps {
  state: CreateAccountDialogStates
  handleCreateAccount: () => void
  handleClose: () => void
}
const CreateAccountSetupDialog: React.FC<CreateAccountSetupScreenProps> = ({
  state,
  handleCreateAccount,
  handleClose
}) => {
  const isCreatingAccount = useAtomValue(isCreatingAccountState)

  const shouldDialogOpen = (): boolean => {
    return state === CreateAccountDialogStates.Initial || state === CreateAccountDialogStates.Reminder
  }

  return (
    <Dialog open={shouldDialogOpen()} maxWidth={742} sx={{ boxShadow: 'none' }}>
      <Box width='742px' sx={{ backgroundImage: `url(${BgDialog.src})`, position: 'relative', padding: '52px 33px' }}>
        <BoxWrapper>
          <TextHead>Open Account</TextHead>
          <Box my='20px' lineHeight={1.3} color='#989898'>
            <Typography variant='p_xlg'>Welcome! This is your first time connecting this wallet to {NETWORK_NAME} Clone Liquidity. Please open an account on {NETWORK_NAME} Solana Network by simply pressing the button below. Afterwards, you will see a wallet popup requesting a transaction. Keep in mind that Solana Network requires one time fee of </Typography><Typography variant='p_xlg' color='#4fe5ff'>~0.07 {NETWORK_NAME} SOL</Typography><Typography variant='p_xlg'> for most optimal experience using {NETWORK_NAME} Clone Liquidity.</Typography>
          </Box>
          <EnterButton onClick={handleCreateAccount} disabled={isCreatingAccount}><Typography variant='p_xlg'>Open {NETWORK_NAME} Account</Typography></EnterButton>
        </BoxWrapper>
        <Box sx={{ position: 'absolute', right: '10px', top: '10px' }}>
          <CloseButton handleClose={handleClose} />
        </Box>
      </Box>
    </Dialog>
  )
}

const BoxWrapper = styled(Box)`
  width: 500px;
  color: #fff;
  margin: 0 auto;
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

export default CreateAccountSetupDialog

