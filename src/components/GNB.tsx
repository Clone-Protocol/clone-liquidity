import React, { useEffect, useMemo, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { useRouter } from 'next/router'
import { AppBar, Box, Button, Stack, Toolbar, Container, Typography, IconButton, styled, Theme, useMediaQuery } from '@mui/material'
import Image from 'next/image'
import logoIcon from 'public/images/logo-liquidity.svg'
import walletIcon from 'public/images/wallet-icon.svg'
import { useSnackbar } from 'notistack'
import { makeStyles } from '@mui/styles'
import { GNB_ROUTES } from '~/routes'
import CancelIcon from './Icons/CancelIcon'
import MenuIcon from './Icons/MenuIcon'
import { useScroll } from '~/hooks/useScroll'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { shortenAddress } from '~/utils/address'
import { useWalletDialog } from '~/hooks/useWalletDialog'
import { useIncept } from '~/hooks/useIncept'
import MoreMenu from '~/components/Common/MoreMenu';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getOnUSDAccount, getTokenAccount } from "~/utils/token_accounts";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import useInitialized from '~/hooks/useInitialized'
import { useCreateAccount } from '~/hooks/useCreateAccount'
import { CreateAccountDialogStates } from '~/utils/constants'
import { createAccountDialogState, declinedAccountCreationState, isCreatingAccountState, openConnectWalletGuideDlogState } from '~/features/globalAtom'
import CreateAccountSetupDialog from '~/components/Account/CreateAccountSetupDialog'
import TokenFaucetDialog from './Account/TokenFaucetDialog'
import ReminderNewWalletPopup from './Account/ReminderNewWalletPopup'
import MobileWarningDialog from './Common/MobileWarningDialog'
import ConnectWalletGuideDialog from './Common/ConnectWalletGuideDialog'
import { sendAndConfirm } from '~/utils/tx_helper'
import { useTransactionState } from '~/hooks/useTransactionState'
import { PROGRAM_ADDRESS as JUPITER_PROGRAM_ADDRESS, createMintUsdcInstruction, Jupiter } from 'incept-protocol-sdk/sdk/generated/jupiter-agg-mock/index'
import { DEVNET_TOKEN_SCALE } from 'incept-protocol-sdk/sdk/src/clone'
import { PublicKey } from '@solana/web3.js'
import { BN } from "@coral-xyz/anchor"


const GNB: React.FC = () => {
	const router = useRouter()
	const { pathname } = router
	const [path, setPath] = useState<string>('/')
	const [mobileNavToggle, setMobileNavToggle] = useState(false)
	const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

	const { scrolled } = useScroll()

	const firstPathname = useMemo(() => {
		return pathname.split('/').slice(0, 2).join('/')
	}, [pathname])

	const handleMobileNavBtn = () => setMobileNavToggle((prev) => !prev)

	useEffect(() => {
		const path = GNB_ROUTES.find((route) => firstPathname === route.path)?.path
		if (path) setPath(path)
	}, [firstPathname])

	const navClassName = useMemo(() => {
		let className = mobileNavToggle ? 'mobile-on' : ''
		className += scrolled ? ' scrolled' : ''
		return className
	}, [mobileNavToggle, scrolled])

	return (
		<>
			<NavPlaceholder />
			<StyledAppBar className={navClassName} position="static">
				<Container maxWidth={false}>
					<Toolbar disableGutters>
						<Image src={logoIcon} width={148} height={36} alt="clone" />
						<Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}></Box>
						<Box sx={{ flexGrow: 0, display: { xs: 'none', sm: 'inherit' } }}>
							<RightMenu />
						</Box>
						<Box sx={{ marginLeft: 'auto', display: { xs: 'flex', sm: 'none' } }}>
							<IconButton sx={{ color: 'white' }} onClick={handleMobileNavBtn}>
								{mobileNavToggle ? <CancelIcon color="info" /> : <MenuIcon />}
							</IconButton>
						</Box>
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
	const { enqueueSnackbar } = useSnackbar()
	const { connect, connecting, connected, publicKey, disconnect } = useWallet()
	const wallet = useAnchorWallet()
	const { setOpen } = useWalletDialog()
	const { getCloneApp } = useIncept()
	const [openTokenFaucet, setOpenTokenFaucet] = useState(false)
	const [mintUsdi, setMintUsdi] = useState(false)
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [showWalletSelectPopup, setShowWalletSelectPopup] = useState(false)
	const [createAccountDialogStatus, setCreateAccountDialogStatus] = useRecoilState(createAccountDialogState)
	const [declinedAccountCreation, setDeclinedAccountCreation] = useRecoilState(declinedAccountCreationState)
	const [openConnectWalletGuideDlog, setOpenConnectWalletGuideDialog] = useRecoilState(openConnectWalletGuideDlogState)
	const setIsCreatingAccount = useSetRecoilState(isCreatingAccountState)
	const { setTxState } = useTransactionState()

	// on initialize, set to open account creation
	useInitialized(connected, publicKey, wallet)
	useCreateAccount()

	// create the account when the user clicks the create account button
	const handleCreateAccount = () => {
		setIsCreatingAccount(true)
	}

	const closeAccountSetupDialog = () => {
		setCreateAccountDialogStatus(CreateAccountDialogStates.Closed)
		setDeclinedAccountCreation(true)
		router.replace('/')
	}
	useEffect(() => {

		async function userMintOnusd() {
			const onusdToMint = 100;
			if (connected && publicKey && mintUsdi && wallet) {
				try {
					const program = getCloneApp(wallet)
					await program.loadClone()
					const usdiTokenAccount = await getOnUSDAccount(program);
					const onusdAta = await getAssociatedTokenAddress(program.clone!.onusdMint, publicKey);

					let [jupiterAddress, nonce] = PublicKey.findProgramAddressSync(
						[Buffer.from("jupiter")],
						new PublicKey(JUPITER_PROGRAM_ADDRESS)
					);
					let jupiterAccount = await Jupiter.fromAccountAddress(program.connection, jupiterAddress)
					const usdcTokenAccount = await getTokenAccount(jupiterAccount.usdcMint, publicKey, program.connection);
					const usdcAta = await getAssociatedTokenAddress(jupiterAccount.usdcMint, publicKey);

					let ixnCalls = []
					try {
						if (usdcTokenAccount === undefined) {
							ixnCalls.push((async () => createAssociatedTokenAccountInstruction(publicKey, usdcAta, publicKey, jupiterAccount.usdcMint))())
						}
						if (usdiTokenAccount === undefined) {
							ixnCalls.push((async () => createAssociatedTokenAccountInstruction(publicKey, onusdAta, publicKey, program.clone!.onusdMint))())
						}

						ixnCalls.push(
							createMintUsdcInstruction(
								{
									usdcMint: jupiterAccount.usdcMint,
									usdcTokenAccount: usdcAta,
									jupiterAccount: jupiterAddress,
									tokenProgram: TOKEN_PROGRAM_ID
								}, {
								nonce,
								amount: new BN(onusdToMint * Math.pow(10, 7))
							}
							)
						)

						ixnCalls.push(
							await program.mintOnusdInstruction(
								new BN(onusdToMint * Math.pow(10, DEVNET_TOKEN_SCALE)),
								onusdAta,
								usdcAta
							)
						)

						let ixns = await Promise.all(ixnCalls)
						await sendAndConfirm(program.provider, ixns, setTxState)
					} catch (e) {
						console.error(e)
					}

				} finally {
					setMintUsdi(false)
				}
			}
		}
		userMintOnusd()
	}, [mintUsdi, connected, publicKey])

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
		router.replace('/')
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
					{showWalletSelectPopup && <WalletSelectBox>
						<Stack direction='row' alignItems='center'>
							<WalletAddress onClick={handleChangeWallet}>
								{publicKey && (
									<Typography variant='h7'>{shortenAddress(publicKey.toString())}</Typography>
								)}
							</WalletAddress>
							<Stack direction='row' spacing={2}>
								<CopyToClipboard text={publicKey!!.toString()}
									onCopy={() => enqueueSnackbar('Copied address')}>
									<PopupButton><Typography variant='p_sm'>Copy</Typography></PopupButton>
								</CopyToClipboard>
								<PopupButton><Typography variant='p_sm' onClick={handleDisconnect}>Disconnect</Typography></PopupButton>
							</Stack>
						</Stack>
					</WalletSelectBox>}
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
	height: 60px;
	position: fixed;
	z-index: 300;
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
	.MuiToolbar-root {
		height: 100%;
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
const NetworkInfo = styled(Box)`
	text-align: center;
	line-height: 19px;
	width: 104px;
	border-style: solid;
	border-width: 0.5px;
	border-image-source: ${(props) => props.theme.gradients.metallic};
	border-image-slice: 1;
	color: #fff;
	margin: 0 auto;
	margin-top: 12px;
`

const useStyles = makeStyles(({ palette }: Theme) => ({
	indicator: {
		display: 'flex',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		height: '3px',
		'& > div': {
			maxWidth: '20%',
			width: '100%',
			marginLeft: '-3px',
			backgroundColor: palette.primary.main,
		},
	},
}))
