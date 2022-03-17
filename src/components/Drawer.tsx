import MuiDrawer from '@mui/material/Drawer'
import { styled, List, ListItemButton, ListItemIcon, ListItemText, Box, Stack } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import menuOverviewIcon from 'public/images/menu/overview-icon.png'
import menuLiquidityIcon from 'public/images/menu/position-icon.png'
import menuBorrowIcon from 'public/images/menu/borrow-icon.png'
import menuOverviewIconSelected from 'public/images/menu/overview-icon-selected.png'
import menuLiquidityIconSelected from 'public/images/menu/position-icon-selected.png'
import menuBorrowIconSelected from 'public/images/menu/borrow-icon-selected.png'
import { useRouter } from 'next/router'
import { withCsrOnly } from '~/hocs/CsrOnly'

const Drawer: React.FC = () => {
	const router = useRouter()

	return (
		<StyledDrawer variant="permanent" open={true}>
			<List component="nav">
				<Link href="/">
					<ListItemButton>
						<ListItemIcon sx={{ marginLeft: '20px' }}>
							{router.asPath === '/' ? (
								<Image src={menuOverviewIconSelected} alt="overview" />
							) : (
								<Image src={menuOverviewIcon} alt="overview" />
							)}
						</ListItemIcon>
						<StyledListItemText>Overview</StyledListItemText>
					</ListItemButton>
				</Link>
				<Link href="/liquidity">
					<ListItemButton>
						<ListItemIcon sx={{ marginLeft: '20px' }}>
							{router.asPath === '/liquidity' ? (
								<Image src={menuLiquidityIconSelected} alt="portfolio" />
							) : (
								<Image src={menuLiquidityIcon} alt="portfolio" />
							)}
						</ListItemIcon>
						<StyledListItemText>My Liquidity</StyledListItemText>
					</ListItemButton>
				</Link>
				<Link href="/borrow">
					<ListItemButton>
						<ListItemIcon sx={{ marginLeft: '20px' }}>
							{router.asPath === '/borrow' ? (
								<Image src={menuBorrowIconSelected} alt="markets" />
							) : (
								<Image src={menuBorrowIcon} alt="markets" />
							)}
						</ListItemIcon>
						<StyledListItemText>Borrow</StyledListItemText>
					</ListItemButton>
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
		background: '#171717',
		color: '#fff',
		whiteSpace: 'nowrap',
		width: 209,
		marginTop: 60,
		borderRight: '1px solid #3f3f3f',
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

const StyledListItemText = styled(Box)`
	font-size: 14px;
	font-weight: 600;
	height: 44px;
	line-height: 44px;
`
