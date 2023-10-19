import { usePathname } from 'next/navigation'
import { List, ListItemButton, Fade, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Link from 'next/link'

const NaviMenu = () => {
  const pathname = usePathname()

  return (
    <Fade in timeout={1500}>
      <List component="nav" sx={{ display: 'flex', padding: 0 }}>
        <Link href="/">
          <StyledListItemButton className={pathname === '/' || pathname?.startsWith('/assets') ? 'selected' : ''}>
            <Typography variant="p">Home</Typography>
          </StyledListItemButton>
        </Link>
        <Link href="/comet/myliquidity">
          <StyledListItemButton className={pathname?.startsWith('/comet/myliquidity') ? 'selected' : ''}>
            <Typography variant="p">Comet</Typography>
          </StyledListItemButton>
        </Link>
        <Link href="/borrow/myliquidity">
          <StyledListItemButton className={pathname?.startsWith('/borrow') ? 'selected' : ''}>
            <Typography variant="p">Borrow</Typography>
          </StyledListItemButton>
        </Link>
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