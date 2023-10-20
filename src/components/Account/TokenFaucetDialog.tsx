import { Box, styled, Dialog, DialogContent, Stack, Typography } from '@mui/material'
import { FadeTransition } from '~/components/Common/Dialog'
import Image from 'next/image'
import ShareIcon from 'public/images/icon-share.svg'
import WalletIcon from 'public/images/wallet-icon.svg'
import infoOutlineIcon from 'public/images/info-outline.svg'
import ConnectWalletIcon from 'public/images/icons-connect-wallet.svg'
import { CloseButton } from '../Common/CommonButtons';

const TokenFaucetDialog = ({ open, isConnect, connectWallet, onGetUsdiClick, onHide }: { open: boolean, isConnect: boolean, connectWallet: () => void, onGetUsdiClick: () => void, onHide: () => void }) => {

  return (
    <>
      <Dialog open={open} onClose={onHide} TransitionComponent={FadeTransition}>
        <DialogContent sx={{ backgroundColor: '#000', border: 'solid 1px #414e66', borderRadius: '5px' }}>
          <BoxWrapper>
            <Box mb="21px"><Typography variant='h3' fontWeight={500}>Devnet Token Faucet</Typography></Box>
            <a href="https://solfaucet.com/" target="_blank" rel="noreferrer">
              <LinkBox>
                <Stack direction='row' justifyContent='space-between' alignItems='center' width='100%'>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Image src={'/images/sol-raw.png'} width={27} height={27} alt='sol' />
                    <Typography variant='p'>Devnet SOL</Typography>
                  </Stack>
                  <Image src={ShareIcon} alt="share" />
                </Stack>
              </LinkBox>
            </a>
            <LinkBox mt="12px" mb="12px" onClick={onGetUsdiClick}>
              <Stack direction='row' justifyContent='space-between' alignItems='center' width='100%'>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Image src={'/images/assets/on-usd.svg'} width={24} height={24} alt='devUSD' />
                  <Typography variant='p' color={!isConnect ? '#989898' : ''}>Devnet USD ($100)</Typography>
                </Stack>
                <Box>
                  {
                    isConnect ? (
                      <Image src={WalletIcon} alt="wallet" />
                    ) : (
                      <Stack direction='row' alignItems='center' onClick={connectWallet} sx={{ cursor: 'pointer' }}>
                        <Image src={ConnectWalletIcon} alt="wallet" />
                        <Box width='44px' lineHeight={0.7} ml='5px'><Typography variant='p_sm' color='#fffc72'>Connect Wallet</Typography></Box>
                      </Stack>
                    )
                  }
                </Box>
              </Stack>
            </LinkBox>
            <InfoBox mb="12px" noHover={true}>
              <Image src={infoOutlineIcon} alt="info" />
              <Typography variant='p' ml='12px'>
                You need Devnet SOL in your wallet before you can claim Devnet USD.
              </Typography>
            </InfoBox>
            <a href="https://www.alchemy.com/overviews/solana-devnet" target='_blank' rel="noreferrer">
              <InfoBox>
                <Image src={infoOutlineIcon} alt="info" />
                <Typography variant='p' ml='12px'>
                  The Solana Devnet is a safe playground for developers, users, and validators to test applications at no risk. Click this box to learn more.
                </Typography>
              </InfoBox>
            </a>

            <Box sx={{ position: 'absolute', right: '10px', top: '10px' }}>
              <CloseButton handleClose={onHide} />
            </Box>
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
  border-radius: 5px;
`
const LinkBox = styled(Box)`
  display: flex;
  align-items: center;
  width: 347px;
  height: 54px;
  padding: 8px 20px;
  background: ${(props) => props.theme.basis.darkNavy};
  border: solid 1px ${(props) => props.theme.basis.shadowGloom};
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
  &:hover {
    border-color: ${(props) => props.theme.basis.liquidityBlue};
  }
`
const InfoBox = styled(Box) <{ noHover?: boolean }>`
  width: 347px;
  display: flex;
  align-items: center;
  padding: 8px 20px;
  line-height: 1.33;
  cursor: ${(props) => props.noHover ? 'initial' : 'pointer'};
  border: solid 1px ${(props) => props.theme.basis.shadowGloom};
  color: ${(props) => props.theme.palette.text.secondary};
  &:hover {
    border-color: ${(props) => props.noHover ? props.theme.basis.shadowGloom : props.theme.basis.liquidityBlue};
  }
`
const ConnectWallet = styled(Box)`
  width: 70px;
  color: ${(props) => props.theme.palette.warning.main};
  text-align: right;
  line-height: 15px;
  cursor: pointer;
`

export default TokenFaucetDialog