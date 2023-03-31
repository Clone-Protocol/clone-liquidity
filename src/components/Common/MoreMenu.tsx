import { styled, Typography, Box, Divider } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import Image from 'next/image'
import FaucetIcon from 'public/images/more/faucet-icon.svg'
import DocIcon from 'public/images/more/doc-icon.svg'
import MarketsIcon from 'public/images/more/markets-icon.svg'
import OpportunityIcon from 'public/images/more/opportunities-icon.svg'
import HomeIcon from 'public/images/more/home.svg'
import TwitterIcon from 'public/images/more/twitter.svg'
import DiscordIcon from 'public/images/more/discord.svg'
import { Stack } from '@mui/system';

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
      },
    }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
  >
    <StyledMenuItem onClick={onShowTokenFaucet}>
      <HoverStack direction='row' alignItems='center'>
        <Image src={FaucetIcon} alt="faucet" />
        <Box width='144px' ml='12px'>
          <div><Typography variant='p'>Token Faucet</Typography></div>
          <div><Typography variant='p_sm' color='#989898'>Get started on Solana devnet</Typography></div>
        </Box>
      </HoverStack>
    </StyledMenuItem>
    <StyledDivider />
    <StyledMenuItem>
      <HoverStack direction='row' alignItems='center'>
        <Image src={DocIcon} alt="docs" />
        <Box width='144px' ml='12px'>
          <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='p'>Docs</Typography> <IconBase><ArrowOutwardIcon sx={{ width: '13px' }} /></IconBase></Stack>
          <Box mt='-8px'><Typography variant='p_sm' color='#989898'>Learn about Incept Liquidity</Typography></Box>
        </Box>
      </HoverStack>
    </StyledMenuItem>
    <StyledMenuItem>
      <HoverStack direction='row' alignItems='center'>
        <Image src={MarketsIcon} alt="markets" />
        <Box width='144px' ml='12px'>
          <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='p'>Markets</Typography> <IconBase><ArrowOutwardIcon sx={{ width: '13px' }} /></IconBase></Stack>
          <Box mt='-8px'><Typography variant='p_sm' color='#989898'>Trade all kinds of iAssets</Typography></Box>
        </Box>
      </HoverStack>
    </StyledMenuItem>
    <a href={`https://join-incept.super.site/`} target='_blank' rel="noreferrer">
      <StyledMenuItem>
        <HoverStack direction='row' alignItems='center'>
          <Image src={OpportunityIcon} alt="opportunities" />
          <Box width='144px' ml='12px'>
            <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='p'>Opportunities</Typography> <IconBase><ArrowOutwardIcon sx={{ width: '13px' }} /></IconBase></Stack>
            <Box mt='-8px'><Typography variant='p_sm' color='#989898'>Wanna be a pioneer of Defi?</Typography></Box>
          </Box>
        </HoverStack>
      </StyledMenuItem>
    </a>
    <Stack direction='row' gap={2} justifyContent='center' my='10px'>
      <Image src={HomeIcon} alt="home" />
      <Image src={TwitterIcon} alt="twitter" />
      <Image src={DiscordIcon} alt="discord" />
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
const StyledDivider = styled(Divider)`
	background-color: #3f3f3f;
  width: 180px;
	height: 1px;
  margin: 0 auto;
`
const IconBase = styled('span')`
  color: #989898;
`
const HoverStack = styled(Stack)`
  padding: 6px;
  &:hover {
    background-color: #2d2d2d;
  }
`

export default MoreMenu;