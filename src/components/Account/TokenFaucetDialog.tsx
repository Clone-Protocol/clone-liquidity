import { Box, styled, Dialog, DialogContent, Stack, Typography } from '@mui/material'
import { SliderTransition } from '~/components/Common/Dialog'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import Image from 'next/image'
import walletIcon from 'public/images/wallet-icon.svg'
import infoOutlineIcon from 'public/images/info-outline.svg'

const TokenFaucetDialog = ({ open, onGetUsdiClick, onHide }: { open: boolean, onGetUsdiClick: () => void, onHide: () => void }) => {

  return (
    <>
      <Dialog open={open} onClose={onHide} TransitionComponent={SliderTransition}>
        <DialogContent sx={{ backgroundColor: '#1b1b1b' }}>
          <BoxWrapper>
            <Box mb="21px"><Typography variant='h7'>Token Faucet</Typography></Box>
            <a href="https://solfaucet.com/" target="_blank" rel="noreferrer">
              <LinkBox>
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Image src={'/images/assets/USDi.png'} width="28px" height="28px" />
                    <Typography variant='p'>Devnet SOL</Typography>
                  </Stack>
                  <ArrowOutwardIcon sx={{ width: '13px' }} />
                </Stack>
              </LinkBox>
            </a>
            <LinkBox mt="11px" mb="17px" onClick={onGetUsdiClick}>
              <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Image src={'/images/assets/USDi.png'} width="28px" height="28px" />
                  <Typography variant='p'>Devnet USDi</Typography>
                </Stack>
                <Image src={walletIcon} alt="wallet" />
              </Stack>
            </LinkBox>
            <InfoBox mb="8px">
              <Image src={infoOutlineIcon} alt="info" />
              <Typography variant='p_sm' maxWidth='193px'>
                You need Devnet SOL in you wallet before you can claim Devnet USDi
              </Typography>
            </InfoBox>
            <InfoBox>
              <Image src={infoOutlineIcon} alt="info" />
              <Typography variant='p_sm' maxWidth='193px'>
                The Solana Devnet is a safe playground for developers, users, and validators to test applications at no risk. Learn more.
              </Typography>
              <IconBase><ArrowOutwardIcon sx={{ width: '13px' }} /></IconBase>
            </InfoBox>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}

const BoxWrapper = styled(Box)`
  padding: 8px 1px; 
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
`
const InfoBox = styled(Box)`
  width: 277px;
  display: flex;
  align-items: center;
  border: solid 1px ${(props) => props.theme.palette.text.secondary};
  color: ${(props) => props.theme.palette.text.secondary};
`
const IconBase = styled('span')`
  color: #989898;
  cursor: pointer;
`

export default TokenFaucetDialog