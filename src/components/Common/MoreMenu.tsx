import { styled, Typography, Box } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Image from 'next/image'
import HomeIcon from 'public/images/more/home.svg'
import TwitterIcon from 'public/images/more/twitter.svg'
import DiscordIcon from 'public/images/more/discord.svg'
import { Stack } from '@mui/system';
import { CAREER_URL, DISCORD_URL, DOCS_URL, MARKETS_APP, OFFICIAL_WEB, TWITTER_URL } from '~/data/social';

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
    PaperProps={{
      elevation: 0,
      sx: {
        overflow: 'visible',
        mt: 1.5,
        background: '#1b1b1b',
        color: '#fff',
        border: '1px solid #414e66',
        borderRadius: '5px'
      },
    }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
  >
    <StyledMenuItem onClick={onShowTokenFaucet}>
      <HoverStack direction='row' alignItems='center'>
        <Box width='144px' ml='12px'>
          <div><Typography variant='p'>Token Faucet</Typography></div>
          <div><Typography variant='p_sm' color='#989898'>Get started on Solana devnet</Typography></div>
        </Box>
      </HoverStack>
    </StyledMenuItem>
    <a href={DOCS_URL} target='_blank' rel="noreferrer">
      <StyledMenuItem>
        <HoverStack direction='row' alignItems='center'>
          <Box width='144px' ml='12px'>
            <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='p'>Docs</Typography></Stack>
            <Box><Typography variant='p_sm' color='#989898'>Learn about Clone Liquidity</Typography></Box>
          </Box>
        </HoverStack>
      </StyledMenuItem>
    </a>
    <a href={MARKETS_APP} target='_blank' rel="noreferrer">
      <StyledMenuItem>
        <HoverStack direction='row' alignItems='center'>
          <Box width='144px' ml='12px'>
            <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='p'>Markets</Typography></Stack>
            <Box><Typography variant='p_sm' color='#989898'>Trade all kinds of onAssets</Typography></Box>
          </Box>
        </HoverStack>
      </StyledMenuItem>
    </a>
    <a href={CAREER_URL} target='_blank' rel="noreferrer">
      <StyledMenuItem>
        <HoverStack direction='row' alignItems='center'>
          <Box width='144px' ml='12px'>
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
  </Menu >
}

const StyledMenuItem = styled(MenuItem)`
  display: flex;
  width: 210px;
  height: 35px;
  line-height: 12px;
  color: #fff;
  margin-bottom: 10px;
  padding: 8px 12px;
`
const HoverStack = styled(Stack)`
  padding: 6px;
  &:hover {
    background-color: #2d2d2d;
  }
`

export default MoreMenu;