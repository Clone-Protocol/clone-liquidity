import MuiDrawer from '@mui/material/Drawer'
import { styled, List, ListItemButton, Fade, Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { useOnLinkNeedingAccountClick } from '~/hooks/useOnLinkNeedingAccountClick'
import { openConnectWalletGuideDlogState } from '~/features/globalAtom'
import { useSetAtom } from 'jotai'
import { useWallet } from '@solana/wallet-adapter-react'

const Drawer: React.FC = () => {
	const router = useRouter()
	const { connected } = useWallet()
	const setOpenConnectWalletGuideDlogState = useSetAtom(openConnectWalletGuideDlogState)
	const handleLinkNeedingAccountClick = useOnLinkNeedingAccountClick()

	const handleClickNavWhenUnconnected = (evt: React.MouseEvent) => {
		evt.preventDefault()
		setOpenConnectWalletGuideDlogState(true)
	}

	return (
		<StyledDrawer variant="permanent" open={true}>
			<Fade in timeout={1500}>
				<List component="nav">
					<Link href="/">
						<StyledListItemButton className={router.asPath === '/' || router.asPath.startsWith('/assets') ? 'selected' : ''}>
							<Typography variant="p">Overview</Typography>
						</StyledListItemButton>
					</Link>
					<Link href="/liquidity">
						<StyledListItemButton className={router.asPath.startsWith('/liquidity') ? 'selected' : ''} onClick={connected ? handleLinkNeedingAccountClick : handleClickNavWhenUnconnected}>
							<Typography variant="p">My Liquidity</Typography>
						</StyledListItemButton>
					</Link>
					<Link href="/borrow">
						<StyledListItemButton className={router.asPath.startsWith('/borrow') ? 'selected' : ''} onClick={connected ? handleLinkNeedingAccountClick : handleClickNavWhenUnconnected}>
							<Typography variant="p">Borrow</Typography>
						</StyledListItemButton>
					</Link>
				</List>
			</Fade>
		</StyledDrawer>
	)
}

export default withCsrOnly(Drawer)

const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
	'& .MuiDrawer-paper': {
		position: 'relative',
		background: theme.palette.common.black,
		whiteSpace: 'nowrap',
		width: 144,
		marginTop: 75,
		paddingTop: 20,
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
		boxSizing: 'border-box',
		...(!open && {
			overflowX: 'hidden',
			transition: theme.transitions.create('width', {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.leavingScreen,
			}),
			width: theme.spacing(7),
			[theme.breakpoints.up('sm')]: {
				width: theme.spacing(9),
			},
		}),
	},
}))

const StyledListItemButton = styled(ListItemButton)`
	color: ${(props) => props.theme.palette.text.secondary};
	width: 100px;
  height: 40px;
  margin-left: 14px;
  margin-right: 14px;
  margin-bottom: 8px;
	line-height: 1.33;
  &.selected {
    color: ${(props) => props.theme.palette.common.white};
  }
  &:hover {
    background-color: ${(props) => props.theme.boxes.darkBlack};
  }
`

