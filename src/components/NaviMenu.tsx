import { usePathname } from 'next/navigation'
import { List, ListItemButton, Fade, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Link from 'next/link'
import { IS_DEV } from '~/data/networks'

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
        {/* @TODO : implement this after mainnet
        <Link href="/bridge">
          <StyledListItemButton className={pathname?.startsWith('/bridge') ? 'selected' : ''}>
            <Typography variant="p_lg">Bridge</Typography>
          </StyledListItemButton>
        </Link> */}
        {!IS_DEV &&
          <Link href="/points">
            <StyledListItemButton className={pathname?.startsWith('/points') ? 'selected' : ''}>
              <Typography variant="p_lg">Points</Typography>
            </StyledListItemButton>
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
    background-color: rgba(196, 181, 253, 0.1);
  }
  &.selected {
    color: #fff;
    transition: all 0.3s ease 0.2s;
  }
`

export default NaviMenu