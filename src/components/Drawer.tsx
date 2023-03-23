import MuiDrawer from '@mui/material/Drawer'
import { styled, List, ListItemButton, Fade, Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { useOnLinkNeedingAccountClick } from '~/hooks/useOnLinkNeedingAccountClick'

const Drawer: React.FC = () => {
	const router = useRouter()
	const handleLinkNeedingAccountClick = useOnLinkNeedingAccountClick()

	return (
		<StyledDrawer variant="permanent" open={true}>
			<Fade in timeout={1500}>
				<List component="nav">
					<Link href="/">
						<StyledListItemButton className={router.asPath === '/' || router.asPath.startsWith('/assets') ? 'selected' : ''} onClick={handleLinkNeedingAccountClick}>
							<Typography variant="p">Overview</Typography>
						</StyledListItemButton>
					</Link>
					<Link href="/liquidity">
						<StyledListItemButton className={router.asPath.startsWith('/liquidity') ? 'selected' : ''} onClick={handleLinkNeedingAccountClick}>
							<Typography variant="p">My Liquidity</Typography>
						</StyledListItemButton>
					</Link>
					<Link href="/borrow">
						<StyledListItemButton className={router.asPath.startsWith('/borrow') ? 'selected' : ''} onClick={handleLinkNeedingAccountClick}>
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
		marginTop: 60,
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
    transition: all 0.3s ease 0.2s;
  }
  &:hover {
    background-color: ${(props) => props.theme.boxes.darkBlack};
  }
`

