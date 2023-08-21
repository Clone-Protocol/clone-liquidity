import React, { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { AppBar, Box, Button, Toolbar, Container, Typography, styled, useMediaQuery, Theme } from '@mui/material'
import Image from 'next/image'
import logoIcon from 'public/images/logo-liquidity.svg'
import walletIcon from 'public/images/wallet-icon.svg'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { shortenAddress } from '~/utils/address'
import { useWalletDialog } from '~/hooks/useWalletDialog'
import useInitialized from '~/hooks/useInitialized'
import { useCreateAccount } from '~/hooks/useCreateAccount'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState, isCreatingAccountState, openConnectWalletGuideDlogState, isAlreadyInitializedAccountState } from '~/features/globalAtom'
import dynamic from 'next/dynamic'
import useFaucet from '~/hooks/useFaucet'
import TokenFaucetDialog from './Account/TokenFaucetDialog'
import WalletSelectBox from './Common/WalletSelectBox'

const GNB: React.FC = () => {
	// const [mobileNavToggle, setMobileNavToggle] = useState(false)
	const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

	const MobileWarningDialog = dynamic(() => import('./Common/MobileWarningDialog'))
	const TempWarningMsg = dynamic(() => import('~/components/Common/TempWarningMsg'), { ssr: false })

	// const { scrolled } = useScroll()
	// const handleMobileNavBtn = () => setMobileNavToggle((prev) => !prev)
	// const navClassName = useMemo(() => {
	// 	let className = mobileNavToggle ? 'mobile-on' : ''
	// 	className += scrolled ? ' scrolled' : ''
	// 	return className
	// }, [mobileNavToggle, scrolled])

	return (
		<>
			<NavPlaceholder />
			<StyledAppBar position="static">
				<TempWarningMsg />
				<Container maxWidth={false}>
					<Toolbar disableGutters>
						<Image src={logoIcon} width={148} height={36} alt="clone" />
						<Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}></Box>
						<Box sx={{ flexGrow: 0, display: { xs: 'none', sm: 'inherit' } }}>
							<RightMenu />
						</Box>
						{/* <Box sx={{ marginLeft: 'auto', display: { xs: 'flex', sm: 'none' } }}>
							<IconButton sx={{ color: 'white' }} onClick={handleMobileNavBtn}>
								{mobileNavToggle ? <CancelIcon color="info" /> : <MenuIcon />}
							</IconButton>
						</Box> */}
					</Toolbar>
				</Container>
				<MobileWarningDialog open={isMobile} handleClose={() => { return null }} />
			</StyledAppBar>
		</>
	)
}

export default withCsrOnly(GNB)

const RightMenu = () => {
	const router = useRouter()
	const { connect, connecting, connected, publicKey, disconnect } = useWallet()
	const wallet = useAnchorWallet()
	const { setOpen } = useWalletDialog()
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

	// on initialize, set to open account creation
	useInitialized(connected, publicKey, wallet)
	useCreateAccount()
	const { setMintUsdi } = useFaucet()

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
					<ConnectButton
						onClick={handleWalletClick}
						disabled={connecting}
						startIcon={<Image src={walletIcon} alt="wallet" />}>
						{!connected ? (
							<Typography variant='p'>Connect Wallet</Typography>
						) : (
							<>
								{publicKey && (
									<Typography variant='p'>{shortenAddress(publicKey.toString())}</Typography>
								)}
							</>
						)}
					</ConnectButton>
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
	padding: 12px;
  margin-left: 16px;
	color: ${(props) => props.theme.palette.text.secondary};
	height: 35px;
  &:hover {
    background-color: ${(props) => props.theme.boxes.darkBlack};
  }
	&:active {
		background-color: ${(props) => props.theme.boxes.darkBlack};
	}
`
const ConnectButton = styled(Button)`
  background-color: ${(props) => props.theme.boxes.black};
	padding: 12px;
  margin-left: 16px;
	color: #fff;
	width: 140px;
	height: 36px;
  &:hover {
    background-color: ${(props) => props.theme.boxes.darkBlack};
  }
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
