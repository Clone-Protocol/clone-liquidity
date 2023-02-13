import React from 'react'
import { useRecoilValue } from 'recoil'
import {
	Button,
	Box,
	Dialog,
	DialogTitle,
	DialogContent,
	styled,
	Typography
} from '@mui/material'
import Image from 'next/image'
import { CreateAccountDialogStates } from '~/utils/constants'
import { isCreatingAccountState } from '~/features/globalAtom'
import logoIcon from 'public/images/logo-liquidity.svg'
import BgDialog from 'public/images/new-wallet-popup.png'

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
	const isCreatingAccount = useRecoilValue(isCreatingAccountState)

	const shouldDialogOpen = (): boolean => {
		return state === CreateAccountDialogStates.Initial || state === CreateAccountDialogStates.Reminder
	}

	if (state === CreateAccountDialogStates.Initial) {
		return (
			<Dialog open={shouldDialogOpen()} onClose={handleClose}>
				<ContentContainer style={{ background: `url(${BgDialog.src})` }}>
					<LeftBox>
						<Image src={logoIcon} width={187} alt="incept" />
						<Box><Typography variant='h5'>Welcome!</Typography></Box>
						<DescBox>
							<Typography variant='p'>This is your first time connecting this wallet to Devnet Incept Liquidity. Please open an account on Devnet Solana Network by simply pressing the button below. Afterwards, you will see a wallet popup requesting a transaction. Keep in mind that Solana Network requires one time fee of <Emphasize>~0.3 Devnet SOL</Emphasize> for most optimal experience using Devnet Incept Liquidity.</Typography>
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
				<Box>
					<Box>
						<Typography variant='p'>To access this feature, please open an account first!</Typography>
					</Box>
					<SubmitButton onClick={handleCreateAccount} disabled={isCreatingAccount}>
						<Typography variant='p_lg'>Take me there</Typography>
					</SubmitButton>
				</Box>
			</Dialog>
		)
	}
}

const ContentContainer = styled('div')`
	width: 809px;
	height: 561px;
	padding: 15px;
	background-color: #151618;
`
const LeftBox = styled(Box)`
	width: 352px;
`
const DescBox = styled(Box)`
	margin-top: 15px;
	margin-bottom: 15px;
	color: ${(props) => props.theme.palette.text.secondary};
`
const Emphasize = styled('span')`
	color: #fff;
	font-weight: 600;
`
const SubmitButton = styled(Button)`
	padding: 16px 41px;
	background-color: ${(props) => props.theme.gradients.simple};
	color: #000;
	display: block;
	width: 100%;
	height: 48px;
	line-height: 1.11;
`

export default CreateAccountSetupDialog
