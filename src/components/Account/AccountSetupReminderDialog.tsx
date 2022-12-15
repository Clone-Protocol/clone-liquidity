import React, { useState } from 'react'
import { 
	Button,
	Box,  
	Dialog, 
	DialogTitle, 
	DialogContent,
	styled,
	Theme
} from '@mui/material'
//import { SliderTransition } from '~/components/Common/Dialog'

interface AccountSetupReminderDialogProps {
	open: boolean
	handleCreateAccount: () => void 
	handleClose: () => void
}
const AccountSetupReminderDialog = ({ open, handleClose, handleCreateAccount}): AccountSetupRemiderDialogProps => {
	return (
		<Dialog open={open} onClose={handleClose}>
			<ContentContainer>
				<HeaderText>This is a new wallet, please open account first</HeaderText>
				<DialogContent>
					<ContentText>
						In order to access the feature, please open an account with this wallet by 
						clicking the button below. Please note that Solana Network requires a higher than usual
						one-time gas fee <Emph>(~0.3 SOL)</Emph> when opening an account for the most optimal experience.
					</ContentText>
					<ButtonBox>
						<SubmitButton onClick={handleCreateAccount}>Open Account</SubmitButton>
					</ButtonBox>
				</DialogContent>
			</ContentContainer>
		</Dialog>
	)
}

const HeaderText = styled(DialogTitle)`
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  text-align: center;
`

const ContentContainer = styled('div')`
	padding: 15px;
	background-color: #151618;
`

const ContentText = styled('Box')`
	font-size: 14px;
	color: #989898;
`

const Emph = styled('span')`
	color: #ffb800
`

const SubmitButton = styled(Button)`
	padding: 13px 45px;
	border-radius: 10px;
	background-color: #4e609f;
	color: #fff;
	margin: 0 auto;
	font-size: 15px;
	display: block;
	width: 240px;
`

const ButtonBox = styled('div')`
	margin-top: 20px;
	width: 100%;
`

export default AccountSetupReminderDialog
