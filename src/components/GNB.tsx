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
						<Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
						</Box>
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
  return (
    <Box display="flex">
      <HeaderButton variant="outlined" sx={{width: '86px', marginRight: '16px'}}>Get USDi</HeaderButton>
      <HeaderButton variant="outlined" sx={{width: '163px'}} startIcon={<Image src={walletIcon} alt="wallet" />}>Connect Wallet</HeaderButton>
      {/* <Button variant="outlined">...</Button> */}
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
  border: 1px solid #fff;
  padding: 14px 11px 12px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  height: 41px;
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
