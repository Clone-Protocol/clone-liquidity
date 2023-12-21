import React, { useCallback, useEffect, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { AppBar, Box, Button, Toolbar, Container, Typography, styled, Theme, useMediaQuery } from '@mui/material'
import Image from 'next/image'
import logoIcon from 'public/images/logo-liquidity.png'
import walletIcon from 'public/images/wallet-icon-small.svg'
import SettingsIcon from 'public/images/buttons-more-menu-settings.svg'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { shortenAddress } from '~/utils/address'
import { useWalletDialog } from '~/hooks/useWalletDialog'
import useInitialized from '~/hooks/useInitialized'
import { useCreateAccount } from '~/hooks/useCreateAccount'
import { CreateAccountDialogStates, NETWORK_NAME } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState, isCreatingAccountState, openConnectWalletGuideDlogState } from '~/features/globalAtom'
import dynamic from 'next/dynamic'
import useFaucet from '~/hooks/useFaucet'
import TokenFaucetDialog from './Account/TokenFaucetDialog'
import NaviMenu from './NaviMenu'
import { isMobile } from 'react-device-detect';
import MoreMenu from './Common/MoreMenu'
import WalletSelectBox from './Common/WalletSelectBox'
import SettingDialog from './Common/SettingDialog'
import { IS_DEV } from '~/data/networks'
import { fetchGeoBlock } from '~/utils/fetch_netlify'

const GNB: React.FC = () => {
	const isMobileOnSize = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

	const MobileWarningDialog = dynamic(() => import('./Common/MobileWarningDialog'))
	const TempWarningMsg = dynamic(() => import('~/components/Common/TempWarningMsg'), { ssr: false })

	return (
		<>
			<NavPlaceholder />
			<StyledAppBar position="static">
				<TempWarningMsg />
				<Container maxWidth={false}>
					<Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
						<Image src={logoIcon} width={100} height={26} alt="clone" />
						<Box ml='60px'><NaviMenu /></Box>
						<RightMenu />
					</Toolbar>
				</Container>
				<MobileWarningDialog open={isMobile || isMobileOnSize} handleClose={() => { return null }} />
			</StyledAppBar>
		</>
	)
}

export default withCsrOnly(GNB)

const RightMenu: React.FC = () => {
	const { connect, connecting, connected, publicKey, disconnect } = useWallet()
	const wallet = useAnchorWallet()
	const { setOpen } = useWalletDialog()
	const [openTokenFaucet, setOpenTokenFaucet] = useState(false)
	const [openSettingDlog, setOpenSettingDlog] = useState(false)
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [showWalletSelectPopup, setShowWalletSelectPopup] = useState(false)
	const [createAccountDialogStatus, setCreateAccountDialogStatus] = useAtom(createAccountDialogState)
	const [declinedAccountCreation, setDeclinedAccountCreation] = useAtom(declinedAccountCreationState)
	const [openConnectWalletGuideDlog, setOpenConnectWalletGuideDialog] = useAtom(openConnectWalletGuideDlogState)
	const setIsCreatingAccount = useSetAtom(isCreatingAccountState)
	const [showGeoblock, setShowGeoblock] = useState(false)

	const CreateAccountSetupDialog = dynamic(() => import('./Account/CreateAccountSetupDialog'))
	const ConnectWalletGuideDialog = dynamic(() => import('./Common/ConnectWalletGuideDialog'))
	const GeoblockDialog = dynamic(() => import('~/components/Common/GeoblockDialog'), { ssr: false })

	// on initialize, set to open account creation
	useInitialized(connected, publicKey, wallet)
	useCreateAccount()
	const { setMintUsdi } = useFaucet()

	// create the account when the user clicks the create account button
	const handleCreateAccount = () => {
		setIsCreatingAccount(true)
	}

	const closeAccountSetupDialog = async () => {
		setCreateAccountDialogStatus(CreateAccountDialogStates.Closed)
		setDeclinedAccountCreation(true)
		await disconnect()
	}

	const handleGetUsdiClick = () => {
		if (declinedAccountCreation) {
			setCreateAccountDialogStatus(CreateAccountDialogStates.Reminder)
		} else {
			setMintUsdi(true)
		}
	}

	const handleMoreClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	}, [])

	const handleWalletClick = async () => {
		try {
			if (!connected) {
				if (!wallet) {
					// validate geoblock
					const geoblock = await fetchGeoBlock()
					console.log('geo', geoblock)

					if (geoblock.result) {
						setOpen(true)
					} else {
						setShowGeoblock(true)
					}
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
				{IS_DEV &&
					<HeaderButton onClick={() => setOpenTokenFaucet(true)}>
						<Typography variant='p'>{NETWORK_NAME} Faucet</Typography>
					</HeaderButton>
				}
				<HeaderButton sx={{ fontSize: '16px', fontWeight: 'bold', paddingBottom: '20px' }} onClick={handleMoreClick}>...</HeaderButton>
				<HeaderButton onClick={() => setOpenSettingDlog(true)}><Image src={SettingsIcon} alt="settings" /></HeaderButton>
				<MoreMenu anchorEl={anchorEl} onShowTokenFaucet={() => setOpenTokenFaucet(true)} onClose={() => setAnchorEl(null)} />
				<Box>
					{
						!connected ?
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
					<WalletSelectBox show={showWalletSelectPopup} onHide={() => setShowWalletSelectPopup(false)} />
				</Box>
			</Box>

			<SettingDialog open={openSettingDlog} handleClose={() => setOpenSettingDlog(false)} />

			<TokenFaucetDialog
				open={openTokenFaucet}
				isConnect={connected}
				connectWallet={handleWalletClick}
				onGetUsdiClick={handleGetUsdiClick}
				onHide={() => setOpenTokenFaucet(false)}
			/>

			<ConnectWalletGuideDialog open={openConnectWalletGuideDlog} connectWallet={handleWalletClick} handleClose={() => setOpenConnectWalletGuideDialog(false)} />
			{showGeoblock && <GeoblockDialog open={showGeoblock} handleClose={() => setShowGeoblock(false)} />}
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
  margin-left: 6px;
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
