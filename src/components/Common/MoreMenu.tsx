import { styled, Typography, Box } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Image from 'next/image'
import HomeIcon from 'public/images/more/home.svg'
import TwitterIcon from 'public/images/more/twitter.svg'
import DiscordIcon from 'public/images/more/discord.svg'
import { Stack } from '@mui/system';
import { CAREER_URL, DISCORD_URL, DOCS_URL, MARKETS_APP, OFFICIAL_WEB, TWITTER_URL } from '~/data/social';
import { NETWORK_NAME } from '~/utils/constants'
import { IS_DEV } from '~/data/networks'

interface Props {
  anchorEl: null | HTMLElement
  onShowTokenFaucet: () => void
  onClose?: () => void
}

const MoreMenu: React.FC<Props> = ({ anchorEl, onShowTokenFaucet, onClose }) => {
  const open = Boolean(anchorEl);

  return <Menu
    anchorEl={anchorEl}
    id="account-menu"
    open={open}
    onClose={onClose}
    onClick={onClose}
    transitionDuration={0}
    PaperProps={{
      elevation: 0,
      sx: {
        overflow: 'visible',
        mt: 1.5,
        transition: 'none',
        transitionDuration: 0,
        background: '#000',
        color: '#fff',
        border: '1px solid #414e66',
        borderRadius: '5px'
      },
    }}
    MenuListProps={{ sx: { pt: 0, pb: '15px' } }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
  >
    {IS_DEV &&
      <StyledMenuItem onClick={onShowTokenFaucet}>
        <HoverStack direction='row' alignItems='center'>
          <Box width='184px'>
            <div><Typography variant='p'>Token Faucet</Typography></div>
            <div><Typography variant='p_sm' color='#989898'>Get started on Solana {NETWORK_NAME}</Typography></div>
          </Box>
        </HoverStack>
      </StyledMenuItem>
    }
    <a href={DOCS_URL} target='_blank' rel="noreferrer">
      <StyledMenuItem>
        <HoverStack direction='row' alignItems='center'>
          <Box width='184px'>
            <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='p'>Docs</Typography></Stack>
            <Box><Typography variant='p_sm' color='#989898'>Learn about Clone Liquidity</Typography></Box>
          </Box>
        </HoverStack>
      </StyledMenuItem>
    </a>
    <a href={MARKETS_APP} target='_blank' rel="noreferrer">
      <StyledMenuItem>
        <HoverStack direction='row' alignItems='center'>
          <Box width='184px'>
            <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='p'>Clone Markets</Typography></Stack>
            <Box><Typography variant='p_sm' color='#989898'>Trade all kinds of clAssets</Typography></Box>
          </Box>
        </HoverStack>
      </StyledMenuItem>
    </a>
    <a href={CAREER_URL} target='_blank' rel="noreferrer">
      <StyledMenuItem>
        <HoverStack direction='row' alignItems='center'>
          <Box width='184px'>
            <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='p'>Opportunities</Typography></Stack>
            <Box><Typography variant='p_sm' color='#989898'>Wanna be a pioneer of Defi?</Typography></Box>
          </Box>
        </HoverStack>
      </StyledMenuItem>
    </a>
    <Stack direction='row' gap={2} justifyContent='center' mt='15px'>
      <a href={OFFICIAL_WEB} target="_blank" rel="noreferrer"><Image src={HomeIcon} alt="home" /></a>
      <a href={TWITTER_URL} target="_blank" rel="noreferrer"><Image src={TwitterIcon} alt="twitter" /></a>
      <a href={DISCORD_URL} target="_blank" rel="noreferrer"><Image src={DiscordIcon} alt="discord" /></a>
    </Stack>
  </Menu>
}

const StyledMenuItem = styled(MenuItem)`
  display: flex;
  width: 220px;
  height: 50px;
  line-height: 12px;
  color: #fff;
  padding: 0 !important;
`
const HoverStack = styled(Stack)`
  width: 100%;
  height: 100%;
  padding: 6px 20px;
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`

export default MoreMenu;