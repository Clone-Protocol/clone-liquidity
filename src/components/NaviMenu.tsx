import { usePathname } from 'next/navigation'
import { List, ListItemButton, Fade, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Link from 'next/link'
import { IS_DEV } from '~/data/networks'
import { PointsStarIcon } from './Common/SvgIcons'

const NaviMenu = () => {
  const pathname = usePathname()

  return (
    <Fade in timeout={1500}>
      <List component="nav" sx={{ display: 'flex', padding: 0 }}>
        <Link href="/">
          <StyledListItemButton className={pathname === '/' || pathname?.startsWith('/assets') ? 'selected' : ''}>
            <Typography variant="p_lg">Home</Typography>
          </StyledListItemButton>
        </Link>
        <Link href="/wrapper">
          <StyledListItemButton className={pathname?.startsWith('/wrapper') ? 'selected' : ''}>
            <Typography variant="p_lg">Wrapper</Typography>
          </StyledListItemButton>
        </Link>
        <Link href="/comet/myliquidity">
          <StyledListItemButton className={pathname?.startsWith('/comet/myliquidity') ? 'selected' : ''}>
            <Typography variant="p_lg">Comet</Typography>
          </StyledListItemButton>
        </Link>
        <Link href="/borrow/myliquidity">
          <StyledListItemButton className={pathname?.startsWith('/borrow') ? 'selected' : ''}>
            <Typography variant="p_lg">Borrow</Typography>
          </StyledListItemButton>
        </Link>
        {!IS_DEV &&
          <Link href="/points">
            <StyledPointsItemButton className={pathname?.startsWith('/points') ? 'selected' : ''}>
              <Typography variant="p_lg">Points</Typography>
              <PointsStarIcon />
            </StyledPointsItemButton>
          </Link>
        }
      </List>
    </Fade>
  )
}

const StyledListItemButton = styled(ListItemButton)`
  height: 41px;
  margin-left: 8px;
  margin-right: 8px;
  border-radius: 5px;
  color: ${(props) => props.theme.basis.slug};
  &:hover {
    border-radius: 5px;
    background-color: ${(props) => props.theme.basis.jurassicGrey};
  }
  &.selected {
    color: #fff;
    transition: all 0.3s ease 0.2s;
  }
`
const StyledPointsItemButton = styled(StyledListItemButton)`
  color: #927e2f;
  &:hover {
    background-color: #181509;
  }
  &.selected {
    color: #fbdc5f;
  }
`

export default NaviMenu