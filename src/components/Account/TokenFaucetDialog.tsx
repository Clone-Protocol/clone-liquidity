import { Box, styled, Dialog, DialogContent, Stack, Typography } from '@mui/material'
import { FadeTransition } from '~/components/Common/Dialog'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import Image from 'next/image'
import WalletIcon from 'public/images/wallet-icon.svg'
import infoOutlineIcon from 'public/images/info-outline.svg'

const TokenFaucetDialog = ({ open, isConnect, connectWallet, onGetUsdiClick, onHide }: { open: boolean, isConnect: boolean, connectWallet: () => void, onGetUsdiClick: () => void, onHide: () => void }) => {

  return (
    <>
      <Dialog open={open} onClose={onHide} TransitionComponent={FadeTransition}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b' }}>
          <BoxWrapper>
            <Box mb="21px"><Typography variant='h7'>Token Faucet</Typography></Box>
            <a href="https://solfaucet.com/" target="_blank" rel="noreferrer">
              <LinkBox>
                <Stack direction='row' justifyContent='space-between' alignItems='center' width='100%'>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Image src={'/images/assets/solana.png'} width="27px" height="27px" />
                    <Typography variant='p'>Devnet SOL</Typography>
                  </Stack>
                  <ArrowOutwardIcon sx={{ width: '13px' }} />
                </Stack>
              </LinkBox>
            </a>
            <LinkBox mt="11px" mb="17px" onClick={onGetUsdiClick}>
              <Stack direction='row' justifyContent='space-between' alignItems='center' width='100%'>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Image src={'/images/assets/USDi.png'} width="27px" height="27px" />
                  <Typography variant='p' color={!isConnect ? '#989898' : ''}>Devnet USDi</Typography>
                </Stack>
                <Box>
                  {
                    isConnect ? (
                      <Image src={WalletIcon} alt="wallet" />
                    ) : (
                      <ConnectWallet onClick={connectWallet}><Typography variant='p'>Connect Wallet</Typography></ConnectWallet>
                    )
                  }
                </Box>
              </Stack>
            </LinkBox>
            <InfoBox mb="8px">
              <Image src={infoOutlineIcon} alt="info" />
              <Typography variant='p_sm' maxWidth='193px' ml='12px'>
                You need Devnet SOL in you wallet before you can claim Devnet USDi
              </Typography>
            </InfoBox>
            <InfoBox>
              <Image src={infoOutlineIcon} alt="info" />
              <Typography variant='p_sm' maxWidth='200px' ml='12px'>
                The Solana Devnet is a safe playground for developers, users, and validators to test applications at no risk. Learn more.
              </Typography>
              <a href='https://www.alchemy.com/overviews/solana-devnet' target="_blank" rel="noreferrer"><IconBase><ArrowOutwardIcon sx={{ width: '13px' }} /></IconBase></a>
            </InfoBox>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}

const BoxWrapper = styled(Box)`
  padding: 1px; 
  color: #fff;
  overflow-x: hidden;
`
const LinkBox = styled(Box)`
  display: flex;
  align-items: center;
  width: 277px;
  height: 52px;
  padding: 12px 14.8px 13px 11px;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  color: #fff;
  cursor: pointer;
  &:hover {
    border-color: #fff;
  }
`
const InfoBox = styled(Box)`
  width: 277px;
  display: flex;
  align-items: center;
  padding: 8px;
  border: solid 1px ${(props) => props.theme.palette.text.secondary};
  color: ${(props) => props.theme.palette.text.secondary};
`
const IconBase = styled('span')`
  color: #989898;
  cursor: pointer;
`
const ConnectWallet = styled(Box)`
  width: 70px;
  color: ${(props) => props.theme.palette.warning.main};
  text-align: right;
  line-height: 15px;
  cursor: pointer;
`

export default TokenFaucetDialog