import React from 'react'
import { 
	Button,
	Box,  
	Dialog, 
	DialogTitle, 
	DialogContent,
	styled
} from '@mui/material'
import { CreateAccountDialogStates } from '~/utils/constants'

interface CreateAccountSetupDialogProps {
	state: CreateAccountDialogStates
	handleCreateAccount: () => void 
	handleClose: () => void
}

const CreateAccountSetupDialog: React.FC<CreateAccountSetupDialogProps> = ({ 
	state,
	handleCreateAccount,
	handleClose
}) => {
	const getInitialDialogHeader = (): React.ReactElement => {
		return <HeaderText>This is the first time connecting this wallet with Incept Liquidity</HeaderText>
	}

	const getReminderDialogHeader = (): React.ReactElement => {
		return <HeaderTextCentered>This is a new wallet, please open account first</HeaderTextCentered>
	}

	const getInitialDialogContent = (): React.ReactElement => {
		return (
			<ContentText>
				Please note that the Solana network requires a higher than usual one-time
				gas fee <Emph>(~0.3 SOL)</Emph> when opening an account for the most optimal experience.
			</ContentText>
		)
	}

	const getReminderDialogContent = (): React.ReactElement => {
		return (
			<ContentText>
				In order to access the feature, please open an account with this wallet by 
				clicking the button below. Please note that Solana Network requires a higher than usual
				one-time gas fee <Emph>(~0.3 SOL)</Emph> when opening an account for the most optimal experience.
			</ContentText>
		)
	}

	const ContentBody = (): React.ReactElement => {
		if (state == CreateAccountDialogStates.Initial) {
			return getInitialDialogContent()
		} else if (state == CreateAccountDialogStates.Reminder) {
			return getReminderDialogContent()
		}

		return <></>
	}

	const Header = (): React.ReactElement => {
		if (state == CreateAccountDialogStates.Initial) {
			return getInitialDialogHeader()
		} else if (state == CreateAccountDialogStates.Reminder) {
			return getReminderDialogHeader()
		}

		return <></>
	}

	const shouldDialogOpen = (): boolean => {
		return state === CreateAccountDialogStates.Initial || state === CreateAccountDialogStates.Reminder
	}
	
	return (
		<Dialog open={shouldDialogOpen()} onClose={handleClose}>
			<ContentContainer>
				<Header />
				<DialogContent>
					<ContentBody />
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
`

const HeaderTextCentered = styled(DialogTitle)`
	font-size: 16px;
  font-weight: 500;
  color: #fff;
  text-align: center;
`

const ContentContainer = styled('div')`
	padding: 15px;
	background-color: #151618;
`
const ContentText = styled(Box)`
	font-size: 14px;
	color: #989898;
`

const Emph = styled('span')`
	color: #ffb800
`

const ButtonBox = styled('div')`
	margin-top: 20px;
	width: 100%;
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
const centeredTextStyle = {

}

export default CreateAccountSetupDialog
