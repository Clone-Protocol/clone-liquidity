import MuiDrawer from '@mui/material/Drawer'
import { styled, List, ListItemButton, ListItemIcon, Box, Stack } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import menuOverviewIcon from 'public/images/menu/overview-icon.svg'
import menuLiquidityIcon from 'public/images/menu/position-icon.svg'
import menuBorrowIcon from 'public/images/menu/borrow-icon.svg'
import { useRouter } from 'next/router'
import { withCsrOnly } from '~/hocs/CsrOnly'

const Drawer: React.FC = () => {
	const router = useRouter()

	return (
		<StyledDrawer variant="permanent" open={true}>
			<List component="nav">
				<Link href="/">
					<StyledListItemButton className={router.asPath === '/' || router.asPath.startsWith('/assets') ? 'selected' : ''}>
						<ListItemIcon sx={{ marginLeft: '10px' }}>
							<Image src={menuOverviewIcon} alt="overview" />
						</ListItemIcon>
						<StyledListItemText>Overview</StyledListItemText>
					</StyledListItemButton>
				</Link>
				<Link href="/liquidity">
					<StyledListItemButton className={router.asPath.startsWith('/liquidity') ? 'selected' : ''}>
						<ListItemIcon sx={{ marginLeft: '10px' }}>
							<Image src={menuLiquidityIcon} alt="portfolio" />
						</ListItemIcon>
						<StyledListItemText>My Liquidity</StyledListItemText>
					</StyledListItemButton>
				</Link>
				<Link href="/borrow">
					<StyledListItemButton className={router.asPath.startsWith('/borrow') ? 'selected' : ''}>
						<ListItemIcon sx={{ marginLeft: '10px' }}>
							<Image src={menuBorrowIcon} alt="markets" />
						</ListItemIcon>
						<StyledListItemText>Borrow</StyledListItemText>
					</StyledListItemButton>
				</Link>
			</List>
			<Stack
				sx={{
					position: 'absolute',
					left: '35px',
					bottom: '15px',
					fontSize: '12px',
					color: '#6c6c6c',
					textAlign: 'center',
				}}
				spacing={2}>
				<div>V1: Polaris Devnet</div>
				<div>© Incept 2022</div>
			</Stack>
		</StyledDrawer>
	)
}

export default withCsrOnly(Drawer)

const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
	'& .MuiDrawer-paper': {
		position: 'relative',
		background: 'rgba(20, 20, 20, 0.75)',
		color: '#fff',
		whiteSpace: 'nowrap',
		width: 241,
		marginTop: 60,
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
  border-radius: 10px;
  height: 41px;
  margin-left: 12px;
  margin-right: 11px;
  margin-bottom: 13px;
  &.selected {
    border: solid 1px #3f3f3f;
    background-image: linear-gradient(to bottom, #000 0%, #000 100%); 
  }
  &:hover {
    background-color: rgba(38, 38, 38, 0.5);
  }
`

const StyledListItemText = styled(Box)`
	font-size: 12px;
	font-weight: bold;
	height: 44px;
	line-height: 44px;
  margin-left: -15px;
`
