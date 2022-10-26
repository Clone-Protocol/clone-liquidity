import { styled } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Image from 'next/image'
import InfoIcon from 'public/images/more/info-icon.svg'
import BookIcon from 'public/images/more/book-icon.svg'
import DiscordIcon from 'public/images/more/discord-icon.svg'
import TradingIcon from 'public/images/more/trading-icon.svg'
import TwitterIcon from 'public/images/more/twitter-icon.svg'

interface Props {
  anchorEl: null | HTMLElement
  onClose?: any 
}

const MoreMenu: React.FC<Props> = ({ anchorEl, onClose }) => {
  const open = Boolean(anchorEl);  

  return <Menu
    anchorEl={anchorEl}
    id="account-menu"
    open={open}
    onClose={onClose}
    onClick={onClose}
    PaperProps={{
      elevation: 0,
      sx: {
        overflow: 'visible',
        border: 'solid 1px #fff',
        borderRadius: '8px',
        boxShadow: '0 0 5px 5px rgba(0, 0, 0, 0.2)',
        mt: 1.5,
        background: '#171717',
        color: '#fff',
      },
    }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
  >
    <StyledMenuItem>
      <div>About</div>
      <Image src={InfoIcon} alt="about" />
    </StyledMenuItem>
    <StyledMenuItem>
      <div>Docs</div>
      <Image src={BookIcon} alt="docs" />
    </StyledMenuItem>
    <StyledMenuItem>
      <div>Discord</div> 
      <Image src={DiscordIcon} alt="discord" />
    </StyledMenuItem>
    <StyledMenuItem>
      <div>Twitter</div>
      <Image src={TwitterIcon} alt="twitter" />
    </StyledMenuItem>
    <StyledMenuItem>
      <div>Incept Markets</div>
      <Image src={TradingIcon} alt="markets" />
    </StyledMenuItem>
  </Menu>
}

const StyledMenuItem = styled(MenuItem)`
  display: flex;
  justify-content: space-between;
  width: 219px;
  height: 35px;
  font-size: 12px;
  font-weight: 600;
  line-height: normal;
  letter-spacing: normal;
  color: #fff;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 8px;
  padding-bottom: 8px;
`

export default MoreMenu;