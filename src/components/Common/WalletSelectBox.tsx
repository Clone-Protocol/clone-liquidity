import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { Box, Stack, styled, Typography } from '@mui/material'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { shortenAddress } from '~/utils/address'
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletDialog } from '~/hooks/useWalletDialog';

const WalletSelectBox = ({ onHide }: { onHide: () => void }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { publicKey, disconnect } = useWallet()
  const { setOpen } = useWalletDialog()

  const handleChangeWallet = () => {
    disconnect()
    setOpen(true)
    onHide && onHide()
  }

  const handleDisconnect = () => {
    disconnect()
    onHide && onHide()
    // refresh page by force
    setTimeout(() => {
      location.reload()
    }, 1000)
  }

  return (
    <WalletWrapper>
      <Stack direction='row' alignItems='center'>
        <WalletAddress onClick={handleChangeWallet}>
          {publicKey && (
            <Typography variant='h7'>{shortenAddress(publicKey.toString())}</Typography>
          )}
        </WalletAddress>
        <Stack direction='row' spacing={2}>
          <CopyToClipboard text={publicKey!!.toString()}
            onCopy={() => enqueueSnackbar('Copied address')}>
            <PopupButton><Typography variant='p_sm'>Copy</Typography></PopupButton>
          </CopyToClipboard>
          <PopupButton><Typography variant='p_sm' onClick={handleDisconnect}>Disconnect</Typography></PopupButton>
        </Stack>
      </Stack>
    </WalletWrapper>
  )
}

export default withSuspense(WalletSelectBox, <LoadingProgress />)

const WalletWrapper = styled(Stack)`
  position: absolute;
  top: 60px;
  right: 0px;
  width: 282px;
  height: 56px;
  padding: 13px 16px;
  background-color: ${(props) => props.theme.boxes.darkBlack};
  z-index: 99;
`
const WalletAddress = styled(Box)`
  color: #fff;
	margin-right: 45px;
	cursor: pointer;
`
const PopupButton = styled(Box)`
	font-size: 10px;
	font-weight: 500;
	color: ${(props) => props.theme.palette.text.secondary};
	cursor: pointer;
`