import React, { useEffect, useMemo, useState } from 'react'
import { AppBar, Box, Button, Stack, Toolbar, Container } from '@mui/material'
import Image from 'next/image'
import logoIcon from 'public/images/incept-logo.svg'
import walletIcon from 'public/images/wallet-icon.svg'
import { useSnackbar } from 'notistack'
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
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import MoreMenu from '~/components/Common/MoreMenu';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { getUSDiAccount } from "~/utils/token_accounts";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token'
import { Transaction } from "@solana/web3.js";


const GNB: React.FC = () => {
	const router = useRouter()
	const { pathname, push } = router
	const [path, setPath] = useState<string>('/')
	const [mobileNavToggle, setMobileNavToggle] = useState(false)
	const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

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
					<Toolbar disableGutters sx={{ paddingLeft: '1px' }}>
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
  const { enqueueSnackbar } = useSnackbar()
	const { connect, connecting, connected, publicKey, disconnect } = useWallet()
	const wallet = useAnchorWallet()
	const { setOpen } = useWalletDialog()
	const { getInceptApp } = useIncept()
	const [mintUsdi, setMintUsdi] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showWalletSelectPopup, setShowWalletSelectPopup] = useState(false)

	useEffect(() => {
		async function userMintUsdi() {
			if (connected && publicKey && mintUsdi) {
				const program = getInceptApp()
				await program.loadManager()
				const usdiTokenAccount = await getUSDiAccount(program);
				try {
					if (usdiTokenAccount === undefined) {
						console.log("NO USDI ACCOUNT!")
						const ata = await getAssociatedTokenAddress(program.manager!.usdiMint, program.provider.publicKey!);
						const transactions = new Transaction().add(
							await createAssociatedTokenAccountInstruction(program.provider.publicKey!, ata, program.provider.publicKey!, program.manager!.usdiMint)
						).add(
							await program.hackathonMintUsdiInstruction(ata, 10000000000)
						);
						await program.provider.sendAndConfirm!(transactions);

					} else {
						await program.hackathonMintUsdi(usdiTokenAccount!, 10000000000);
					} 
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
			console.log('Error connecting to the wallet: ', (error as any).message)
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
  }

	return (
		<Box display="flex">
      <DataLoadingIndicator />
			<HeaderButton onClick={handleGetUsdiClick} variant="outlined" sx={{ width: '86px' }}>
				Get USDi
			</HeaderButton>
      <Box>
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
        { showWalletSelectPopup && <WalletSelectBox spacing={2}>
          <CopyToClipboard text={publicKey!!.toString()}
            onCopy={() => enqueueSnackbar('Copied address')}>
            <PopupButton>Copy Address</PopupButton>
          </CopyToClipboard>
          <PopupButton onClick={handleChangeWallet}>Change Wallet</PopupButton>
          <PopupButton onClick={handleDisconnect}>Disconnect</PopupButton>
        </WalletSelectBox> }
      </Box>
			<HeaderButton sx={{ fontSize: '15px', fontWeight: 'bold', paddingBottom: '20px' }} variant="outlined" onClick={handleMoreClick}>...</HeaderButton>
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
	padding: 12px;
	border-radius: 10px;
	font-size: 11px;
	font-weight: 600;
  margin-left: 16px;
	color: #fff;
  min-width: 40px;
	height: 35px;
  &:hover {
    border: 1px solid #404040;
    background-color: rgba(38, 38, 38, 0.5);
  }
`

const ConnectButton = styled(Button)`
  border: solid 1px #00218f;
  background-color: #001149;
	padding: 12px;
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

const WalletSelectBox = styled(Stack)`
  position: absolute;
  top: 60px;
  right: 59px;
  width: 163px;
  height: 139px;
  padding: 14px 17px 16px;
  border-radius: 10px;
  border: solid 1px #253b88;
  background-color: #181818;
  z-index: 99;
`

const PopupButton = styled(Button)`
  width: 129px;
  height: 25px;
  padding: 6px 27px 7px 26px;
  border-radius: 10px;
  border: solid 1px #253b88;
  background-color: #1d243d;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
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
