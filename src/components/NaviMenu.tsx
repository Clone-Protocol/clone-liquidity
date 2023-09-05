import { usePathname } from 'next/navigation'
import { List, ListItemButton, Fade, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Link from 'next/link'
import { useOnLinkNeedingAccountClick } from '~/hooks/useOnLinkNeedingAccountClick'

const NaviMenu = () => {
  const pathname = usePathname()
  const handleLinkNeedingAccountClick = useOnLinkNeedingAccountClick()

  return (
    <Fade in timeout={1500}>
      <List component="nav" sx={{ display: 'flex', padding: 0 }}>
        <Link href="/">
          <StyledListItemButton className={pathname === '/' || pathname?.startsWith('/assets') ? 'selected' : ''}>
            <Typography variant="p">Home</Typography>
          </StyledListItemButton>
        </Link>
        <Link href="/myliquidity">
          <StyledListItemButton className={pathname?.startsWith('/myliquidity') ? 'selected' : ''} onClick={handleLinkNeedingAccountClick}>
            <Typography variant="p">Comet</Typography>
          </StyledListItemButton>
        </Link>
        <Link href="/borrow">
          <StyledListItemButton className={pathname?.startsWith('/borrow') ? 'selected' : ''} onClick={handleLinkNeedingAccountClick}>
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