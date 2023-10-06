///@Deprecated
import React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { createAccountDialogState } from '~/features/globalAtom'
import {
	Button,
	Box,
	Dialog,
	styled,
	Typography
} from '@mui/material'
import Image from 'next/image'
import { CreateAccountDialogStates } from '~/utils/constants'
import { isCreatingAccountState } from '~/features/globalAtom'
import logoIcon from 'public/images/logo-liquidity.svg'
import BgDialog from 'public/images/new-wallet-popup.svg'

interface CreateAccountSetupDialogProps {
	state: CreateAccountDialogStates
	handleCreateAccount: () => void
	handleClose: () => void
}

const CreateAccountSetupDialogOld: React.FC<CreateAccountSetupDialogProps> = ({
	state,
	handleCreateAccount,
	handleClose
}) => {
	const isCreatingAccount = useAtomValue(isCreatingAccountState)
	const setCreateAccountDialogState = useSetAtom(createAccountDialogState)

	const shouldDialogOpen = (): boolean => {
		return state === CreateAccountDialogStates.Initial || state === CreateAccountDialogStates.Reminder
	}

	if (state === CreateAccountDialogStates.Initial) {
		return (
			<Dialog open={shouldDialogOpen()} onClose={handleClose} maxWidth={809} sx={{ boxShadow: 'none' }}>
				<ContentContainer style={{ backgroundImage: `url(${BgDialog.src})` }}>
					<LeftBox>
						<Image src={logoIcon} width={148} height={36} alt="clone" />
						<Box mt="25px"><Typography variant='h5'>Welcome!</Typography></Box>
						<DescBox>
							<Typography variant='p'>This is your first time connecting this wallet to Clone Liquidity on Devnet. Please open an account by pressing the button below. Afterwards, you will see a wallet popup requesting a one time fee of </Typography><Typography variant='p' color='#fff'>~0.26 Devnet SOL.</Typography> <Typography variant='p'>Opening an account is necessary in order to use the features on Clone Liquidity.</Typography>
						</DescBox>
						<SubmitButton onClick={handleCreateAccount} disabled={isCreatingAccount}>
							<Typography variant='p_lg'>Open Devnet Account</Typography>
						</SubmitButton>
					</LeftBox>
				</ContentContainer>
			</Dialog>
		)
	} else {
		return (
			<Dialog open={shouldDialogOpen()} onClose={handleClose}>
				<BoxWrapper p="20px 28px">
					<Box mb="23px">
						<Typography variant='p_lg'>To access this feature, please open an account first!</Typography>
					</Box>
					<SubmitButton onClick={() => setCreateAccountDialogState(CreateAccountDialogStates.Initial)} disabled={isCreatingAccount}>
						<Typography variant='p_lg'>Take me there</Typography>
					</SubmitButton>
				</BoxWrapper>
			</Dialog>
		)
	}
}

const ContentContainer = styled('div')`
	width: 809px;
	height: 559px;
	display: flex;
	align-items: center;
	padding: 40px;
	border-radius: 20px;
`
const LeftBox = styled(Box)`
	width: 352px;
`
const DescBox = styled(Box)`
	margin-top: 5px;
	margin-bottom: 15px;
	line-height: 1.1;
	color: ${(props) => props.theme.palette.text.secondary};
`
const SubmitButton = styled(Button)`
	padding: 16px 41px;
	background-image: ${(props) => props.theme.gradients.simple};
	color: #000;
	display: block;
	width: 100%;
	height: 48px;
	line-height: 1.11;
	&:hover {
		background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), linear-gradient(to right, #fff 21%, #4fe5ff 96%);
	}
`

const BoxWrapper = styled(Box)`
	background-color: ${(props) => props.theme.boxes.darkBlack};
`

export default CreateAccountSetupDialogOld
