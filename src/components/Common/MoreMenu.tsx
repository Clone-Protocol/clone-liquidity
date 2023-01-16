import { styled, Typography, Box, Divider } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import Image from 'next/image'
import FaucetIcon from 'public/images/more/faucet-icon.svg'
import DocIcon from 'public/images/more/doc-icon.svg'
import MarketsIcon from 'public/images/more/markets-icon.svg'
import OpportunityIcon from 'public/images/more/opportunities-icon.svg'
import TwitterIcon from 'public/images/more/twitter-icon.svg'
import Link from 'next/link'
import { Stack } from '@mui/system';

interface Props {
  anchorEl: null | HTMLElement
  onClose?: () => void
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
        mt: 1.5,
        background: '#1b1b1b',
        color: '#fff',
      },
    }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
  >
    <StyledMenuItem>
      <Image src={FaucetIcon} alt="faucet" />
      <Box ml='12px'>
        <div><Typography variant='p'>Token Faucet</Typography></div>
        <div><Typography variant='p_sm' color='#989898'>Get started on Solana devnet</Typography></div>
      </Box>
    </StyledMenuItem>
    <StyledDivider />
    <StyledMenuItem>
      <Image src={DocIcon} alt="docs" />
      <Box ml='12px'>
        <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='p'>Docs</Typography> <IconBase><ArrowOutwardIcon sx={{ width: '13px' }} /></IconBase></Stack>
        <div><Typography variant='p_sm' color='#989898'>Learn about Incept Liquidity</Typography></div>
      </Box>
    </StyledMenuItem>
    <StyledMenuItem>
      <Image src={MarketsIcon} alt="markets" />
      <Box ml='12px'>
        <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='p'>Markets</Typography> <IconBase><ArrowOutwardIcon sx={{ width: '13px' }} /></IconBase></Stack>
        <div><Typography variant='p_sm' color='#989898'>Trade all kinds of iAssets</Typography></div>
      </Box>
    </StyledMenuItem>
    <a href={`https://join-incept.super.site/`} target='_blank' rel="noreferrer">
      <StyledMenuItem>
        <Image src={OpportunityIcon} alt="opportunities" />
        <Box ml='12px'>
          <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='p'>Opportunities</Typography> <IconBase><ArrowOutwardIcon sx={{ width: '13px' }} /></IconBase></Stack>
          <div><Typography variant='p_sm' color='#989898'>Wanna be a pioneer of Defi?</Typography></div>
        </Box>
      </StyledMenuItem>
    </a>
    <Stack justifyContent='center' my='10px'>
      <Image src={TwitterIcon} alt="twitter" />
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
  padding-left: 25px;
  padding-right: 15px;
  padding-top: 8px;
  padding-bottom: 8px;
`
const StyledDivider = styled(Divider)`
	background-color: #3f3f3f;
  width: 168px;
	height: 1px;
  margin: 0 auto;
`

const IconBase = styled('span')`
  color: #989898;
`

export default MoreMenu;