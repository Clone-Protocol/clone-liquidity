import React, { useEffect, useMemo, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
// import Tab from '@mui/material/Tab'
// import Tabs from '@mui/material/Tabs'
import Image from 'next/image'
import logoIcon from 'public/images/incept-logo.png'
import walletIcon from 'public/images/wallet-icon.png'
import { IconButton, styled, Theme, useMediaQuery } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { GNB_ROUTES } from '~/routes'
import { useRouter } from 'next/router'
import CancelIcon from './Icons/CancelIcon'
import MenuIcon from './Icons/MenuIcon'
import { useScroll } from '~/hooks/useScroll'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { shortenAddress } from '~/utils/address'
import { useWalletDialog } from '~/hooks/useWalletDialog'
import { useIncept } from '~/hooks/useIncept'
import MoreMenu from '~/components/Common/MoreMenu';

const GNB: React.FC = () => {
	const router = useRouter()
	const { pathname, push } = router
	const [path, setPath] = useState<string>('/')
	const [mobileNavToggle, setMobileNavToggle] = useState(false)
	const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

	const classes = useStyles()
	const { scrolled } = useScroll()

	const firstPathname = useMemo(() => {
		return pathname.split('/').slice(0, 2).join('/')
	}, [pathname])

	// const handleChange = (_: React.SyntheticEvent, path: string) => {
	// 	if (firstPathname === path) return
	// 	setPath(path)
	// 	push({ pathname: path })
	// }

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
				<Container maxWidth="xl">
					<Toolbar disableGutters sx={{ paddingLeft: '10px' }}>
						<Image src={logoIcon} alt="incept" />
						<LiquidityTitle>Liquidity</LiquidityTitle>
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
			</StyledAppBar>
		</>
	)
}

export default withCsrOnly(GNB)

const RightMenu = () => {
	const { connect, connecting, connected, publicKey, disconnect } = useWallet()
	const wallet = useAnchorWallet()
	const { setOpen } = useWalletDialog()
	const { getInceptApp } = useIncept()
	const [mintUsdi, setMintUsdi] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	useEffect(() => {
		async function userMintUsdi() {
			if (connected && publicKey && mintUsdi) {
				const program = getInceptApp()
				await program.loadManager()

				try {
					const usdiAccount = await program.getOrCreateUsdiAssociatedTokenAccount()
					await program.hackathonMintUsdi(usdiAccount.address, 10000000000)
				} finally {
					setMintUsdi(false)
				}
			}
		}
		userMintUsdi()
	}, [mintUsdi, connected, publicKey])

	const handleGetUsdiClick = () => {
		setMintUsdi(true)
	}

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }

	useEffect(() => {
		async function getAccount() {
			if (connected && publicKey && wallet) {
				const program = getInceptApp()
				await program.loadManager()

				if (!program.provider.wallet) {
					return
				}

				try {
					const userAccount = await program.getUserAccount()
				} catch (error) {
					const response = await program.initializeUser()
				}
			}
		}
		getAccount()
	}, [connected, publicKey])

	const handleWalletClick = () => {
		try {
			if (!connected) {
				if (!wallet) {
					setOpen(true)
				} else {
					connect()
				}
			} else {
				disconnect()
			}
		} catch (error) {
			console.log('Error connecting to the wallet: ', (error as any).message)
		}
	}

	return (
		<Box display="flex">
			<HeaderButton onClick={handleGetUsdiClick} variant="outlined" sx={{ width: '86px' }}>
				Get USDi
			</HeaderButton>
			<ConnectButton
				onClick={handleWalletClick}
				variant="outlined"
				sx={{ width: '163px' }}
				disabled={connecting}
				startIcon={!publicKey ? <Image src={walletIcon} alt="wallet" /> : <></>}>
				{!connected ? (
					<>Connect Wallet</>
				) : (
					<>
						<div style={{ width: '15px', height: '15px', backgroundImage: 'radial-gradient(circle at 0 0, #63ffda, #816cff)', borderRadius: '99px' }} />
						{publicKey ? (
							<Box sx={{ marginLeft: '10px', color: '#fff', fontSize: '11px', fontWeight: '600' }}>
								{shortenAddress(publicKey.toString())}
							</Box>
						) : (
							<></>
						)}
					</>
				)}
			</ConnectButton>
			<HeaderButton sx={{ fontSize: '15px', fontWeight: 'bold', paddingBottom: '18px' }} variant="outlined" onClick={handleMoreClick}>...</HeaderButton>
      <MoreMenu anchorEl={anchorEl} onClose={() => setAnchorEl(null)} />
		</Box>
	)
}

const LiquidityTitle = styled('div')`
	font-size: 21px;
	font-weight: bold;
	background-image: linear-gradient(91deg, #00f0ff -1%, #0038ff 109%);
	-webkit-background-clip: text;
	margin-left: 7px;
	background-clip: text;
	-webkit-text-fill-color: transparent;
`

const StyledAppBar = styled(AppBar)`
	z-index: 200;
	background-color: #000;
	height: 60px;
	position: fixed;
	z-index: 300;
	border-bottom: 1px solid #3f3f3f;
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
	border: 1px solid #404040;
	padding: 12px 12px 10px 13px;
	border-radius: 10px;
	font-size: 11px;
	font-weight: 600;
  margin-left: 16px;
	color: #fff;
	height: 35px;
`

const ConnectButton = styled(Button)`
  border: solid 1px #00218f;
  background-color: #001149;
	padding: 12px 12px 10px 13px;
	border-radius: 10px;
	font-size: 11px;
	font-weight: 600;
  margin-left: 16px;
	color: #fff;
	height: 35px;
  &:hover {
    background-color: #00165f;
  }
  &:active {
    border: solid 1px #003bff;
    background-color: #00165f;
  }
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
