import React, { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { AppBar, Box, Button, Stack, Toolbar, Container, Typography, styled, Theme, useMediaQuery } from '@mui/material'
import Image from 'next/image'
import logoIcon from 'public/images/logo-liquidity.svg'
import walletIcon from 'public/images/wallet-icon.svg'
import { useSnackbar } from 'notistack'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { shortenAddress } from '~/utils/address'
import { useWalletDialog } from '~/hooks/useWalletDialog'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import useInitialized from '~/hooks/useInitialized'
import { useCreateAccount } from '~/hooks/useCreateAccount'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState, isCreatingAccountState, openConnectWalletGuideDlogState } from '~/features/globalAtom'
import { mintUSDi } from '~/features/globalAtom'
import dynamic from 'next/dynamic'
import useFaucet from '~/hooks/useFaucet'
import TokenFaucetDialog from './Account/TokenFaucetDialog'
import NaviMenu from './NaviMenu'

const GNB: React.FC = () => {
	const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

	const MobileWarningDialog = dynamic(() => import('./Common/MobileWarningDialog'))
	const TempWarningMsg = dynamic(() => import('~/components/Common/TempWarningMsg'), { ssr: false })

	return (
		<>
			<NavPlaceholder />
			<StyledAppBar position="static">
				<TempWarningMsg />
				<Container maxWidth={false}>
					<Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
						<Image src={logoIcon} width={144} height={32} alt="clone" />
						<Box ml='60px'><NaviMenu /></Box>
						<RightMenu />
					</Toolbar>
				</Container>
				<MobileWarningDialog open={isMobile} handleClose={() => { return null }} />
			</StyledAppBar>
		</>
	)
}

export default withCsrOnly(GNB)

const RightMenu: React.FC = () => {
	const router = useRouter()
	const { enqueueSnackbar } = useSnackbar()
	const { connect, connecting, connected, publicKey, disconnect } = useWallet()
	const wallet = useAnchorWallet()
	const { setOpen } = useWalletDialog()
	const setMintUsdi = useSetAtom(mintUSDi)
	const [openTokenFaucet, setOpenTokenFaucet] = useState(false)
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [showWalletSelectPopup, setShowWalletSelectPopup] = useState(false)
	const [createAccountDialogStatus, setCreateAccountDialogStatus] = useAtom(createAccountDialogState)
	const [declinedAccountCreation, setDeclinedAccountCreation] = useAtom(declinedAccountCreationState)
	const [openConnectWalletGuideDlog, setOpenConnectWalletGuideDialog] = useAtom(openConnectWalletGuideDlogState)
	const setIsCreatingAccount = useSetAtom(isCreatingAccountState)

	const CreateAccountSetupDialog = dynamic(() => import('./Account/CreateAccountSetupDialog'))
	const MoreMenu = dynamic(() => import('./Common/MoreMenu'))
	const ReminderNewWalletPopup = dynamic(() => import('./Account/ReminderNewWalletPopup'))
	const ConnectWalletGuideDialog = dynamic(() => import('./Common/ConnectWalletGuideDialog'))
	const WalletSelectBox = dynamic(() => import('./Common/WalletSelectBox'))

	// on initialize, set to open account creation
	useInitialized(connected, publicKey, wallet)
	useCreateAccount()
	useFaucet()

	// create the account when the user clicks the create account button
	const handleCreateAccount = () => {
		setIsCreatingAccount(true)
	}

	const closeAccountSetupDialog = () => {
		setCreateAccountDialogStatus(CreateAccountDialogStates.Closed)
		setDeclinedAccountCreation(true)
		router.replace('/')
	}

	const handleGetUsdiClick = () => {
		if (declinedAccountCreation) {
			setCreateAccountDialogStatus(CreateAccountDialogStates.Reminder)
		} else {
			setMintUsdi(true)
		}
	}

	const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	}

	const handleWalletClick = () => {
		try {
			if (!connected) {
				if (!wallet) {
					setOpen(true)
				} else {
					connect()
				}
				setShowWalletSelectPopup(false)
			} else {
				setShowWalletSelectPopup(!showWalletSelectPopup)
			}
		} catch (error) {
			console.log('Error connecting to the wallet: ', error)
		}
	}

	const handleChangeWallet = () => {
		disconnect()
		setShowWalletSelectPopup(false)
		setOpen(true)
	}

	const handleDisconnect = () => {
		disconnect()
		setShowWalletSelectPopup(false)
		// refresh page by force
		setTimeout(() => {
			location.reload()
		}, 1000)
	}

	return (
		<>
			<CreateAccountSetupDialog
				state={createAccountDialogStatus}
				handleCreateAccount={handleCreateAccount}
				handleClose={closeAccountSetupDialog} />

			<Box display="flex">
				<HeaderButton onClick={() => setOpenTokenFaucet(true)}>
					<Typography variant='p'>Devnet Faucet</Typography>
				</HeaderButton>
				<HeaderButton sx={{ fontSize: '15px', fontWeight: 'bold', paddingBottom: '20px' }} onClick={handleMoreClick}>...</HeaderButton>
				<MoreMenu anchorEl={anchorEl} onShowTokenFaucet={() => setOpenTokenFaucet(true)} onClose={() => setAnchorEl(null)} />
				<Box>
					{!connected ?
						<ConnectButton
							onClick={handleWalletClick}
							disabled={connecting}
						>
							<Typography variant='p_lg'>Connect Wallet</Typography>
						</ConnectButton>
						:
						<ConnectedButton onClick={handleWalletClick} startIcon={publicKey ? <Image src={walletIcon} alt="wallet" /> : <></>}>
							<Typography variant='p'>{publicKey && shortenAddress(publicKey.toString())}</Typography>
						</ConnectedButton>
					}
					{showWalletSelectPopup && <WalletSelectBox onHide={() => setShowWalletSelectPopup(false)} />}
					{publicKey && <ReminderNewWalletPopup />}
				</Box>
			</Box>

			<TokenFaucetDialog
				open={openTokenFaucet}
				isConnect={connected}
				connectWallet={handleWalletClick}
				onGetUsdiClick={handleGetUsdiClick}
				onHide={() => setOpenTokenFaucet(false)}
			/>

			<ConnectWalletGuideDialog open={openConnectWalletGuideDlog} connectWallet={handleWalletClick} handleClose={() => setOpenConnectWalletGuideDialog(false)} />
		</>
	)
}

const StyledAppBar = styled(AppBar)`
	background-color: #000;
	position: fixed;
	z-index: 1300;
	top: 0px;
	left: 0px;
	.MuiContainer-root,
	.MuiTabs-flexContainer {
		${(props) => props.theme.breakpoints.up('md')} {
			height: 80px;
		}
		${(props) => props.theme.breakpoints.down('md')} {
			height: 65px;
		}
	}
	&.mobile-on .MuiContainer-root {
		background-color: #3a3a3a;
		border-radius: 0px 0px 20px 20px;
	}
	&.scrolled:not(.mobile-on) {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		border-radius: 20px;
	}
`
const NavPlaceholder = styled('div')`
	${(props) => props.theme.breakpoints.up('md')} {
		height: 80px;
	}
	${(props) => props.theme.breakpoints.down('md')} {
		height: 65px;
	}
`
const HeaderButton = styled(Button)`
	padding: 8px;
  margin-left: 16px;
	color: ${(props) => props.theme.palette.text.secondary};
	height: 42px;
	border-radius: 5px;
  &:hover {
    background-color: ${(props) => props.theme.basis.jurassicGrey};
		color: #fff;
  }
`
const ConnectButton = styled(Button)`
	width: 142px;
	height: 42px;
	padding: 9px;
	border: solid 1px ${(props) => props.theme.basis.liquidityBlue};
	box-shadow: 0 0 10px 0 #005874;
  margin-left: 16px;
	border-radius: 5px;
	color: #fff;
  &:hover {
		background: transparent;
		border: solid 1px ${(props) => props.theme.basis.gloomyBlue};
  }
`
const ConnectedButton = styled(Button)`
	width: 142px;
	height: 42px;
	padding: 9px;
	margin-left: 16px;
	border-radius: 5px;
	color: #fff;
	border: solid 1px ${(props) => props.theme.basis.shadowGloom};
  background: ${(props) => props.theme.basis.jurassicGrey};
	&:hover {
		background: ${(props) => props.theme.basis.jurassicGrey};
    border: solid 1px ${(props) => props.theme.basis.liquidityBlue};
  }
`
const WalletSelectBox = styled(Box)`
  position: absolute;
  top: 60px;
  right: 0px;
  width: 282px;
  height: 56px;
  padding: 13px 16px;
  background-color: ${(props) => props.theme.boxes.darkBlack};
  z-index: 99;
`
const WalletAddress = styled(Box)`
  color: #fff;
	margin-right: 45px;
	cursor: pointer;
`
const PopupButton = styled(Box)`
	font-size: 10px;
	font-weight: 500;
	color: ${(props) => props.theme.palette.text.secondary};
	cursor: pointer;
`

// const useStyles = makeStyles(({ palette }: Theme) => ({
// 	indicator: {
// 		display: 'flex',
// 		justifyContent: 'center',
// 		backgroundColor: 'transparent',
// 		height: '3px',
// 		'& > div': {
// 			maxWidth: '20%',
// 			width: '100%',
// 			marginLeft: '-3px',
// 			backgroundColor: palette.primary.main,
// 		},
// 	},
// }))
