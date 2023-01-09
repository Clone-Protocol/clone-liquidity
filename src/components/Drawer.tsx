import MuiDrawer from '@mui/material/Drawer'
import { styled, List, ListItemButton, ListItemIcon, Box, Stack, Fade } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import menuOverviewIcon from 'public/images/menu/overview-icon.svg'
import menuLiquidityIcon from 'public/images/menu/position-icon.svg'
import menuBorrowIcon from 'public/images/menu/borrow-icon.svg'
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
							<ListItemIcon sx={{ marginLeft: '10px' }}>
								<Image src={menuOverviewIcon} alt="overview" />
							</ListItemIcon>
							<StyledListItemText>Overview</StyledListItemText>
						</StyledListItemButton>
					</Link>
					<Link href="/liquidity">
						<StyledListItemButton className={router.asPath.startsWith('/liquidity') ? 'selected' : ''} onClick={handleLinkNeedingAccountClick}>
							<ListItemIcon sx={{ marginLeft: '10px' }}>
								<Image src={menuLiquidityIcon} alt="portfolio" />
							</ListItemIcon>
							<StyledListItemText>My Liquidity</StyledListItemText>
						</StyledListItemButton>
					</Link>
					<Link href="/borrow">
						<StyledListItemButton className={router.asPath.startsWith('/borrow') ? 'selected' : ''} onClick={handleLinkNeedingAccountClick}>
							<ListItemIcon sx={{ marginLeft: '10px' }}>
								<Image src={menuBorrowIcon} alt="markets" />
							</ListItemIcon>
							<StyledListItemText>Borrow</StyledListItemText>
						</StyledListItemButton>
					</Link>
				</List>
			</Fade>
			<BottomStack spacing={2}>
				<div><span style={{ fontSize: '10px' }}>V1:</span> Polaris Devnet</div>
				<Credit>© Incept 2022</Credit>
			</BottomStack>
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
		marginTop: 62,
		paddingTop: 26,
		borderTopRightRadius: '10px',
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
    transition: all 0.3s ease 0.2s;
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
const BottomStack = styled(Stack)`
	position: absolute;
	left: 65px;
	bottom: 100px;
	font-size: 13px;
	font-weight: 600;
	color: #9c9c9c;
	text-align: center;
`
const Credit = styled('div')`
	font-size: 12px; 
	font-weight: 500;
	color: #8c8c8c;
`
