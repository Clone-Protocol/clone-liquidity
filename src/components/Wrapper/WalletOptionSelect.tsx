import { Box, Typography, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { LoadingProgress } from '~/components/Common/Loading'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import withSuspense from '~/hocs/withSuspense'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useClone } from '~/hooks/useClone';

const WalletOptionSelect = ({ onHide }: { onHide: () => void }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { publicKey, disconnect } = useWallet()

  return <WalletWrapper>
    <CopyToClipboard text={publicKey!!.toString()}
      onCopy={() => enqueueSnackbar('Wallet address copied')}>
      <RowBox>
        <Typography variant='p'>Copy address</Typography>
      </RowBox>
    </CopyToClipboard>
    <RowBox>
      <Typography variant='p'>Change wallet</Typography>
    </RowBox>
    <RowBox>
      <Typography variant='p'>Disconnect</Typography>
    </RowBox>
  </WalletWrapper>
}

export default withSuspense(WalletOptionSelect, <LoadingProgress />)

const WalletWrapper = styled(Stack)`
	width: 129px;
	background-color: ${(props) => props.theme.basis.jurassicGrey};
	border-radius: 5px;
  border: solid 1px ${(props) => props.theme.basis.shadowGloom};
	z-index: 99;
`
const RowBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-bottom: 1px solid ${(props) => props.theme.basis.shadowGloom};
  text-align: center;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.basis.shadowGloom};
  }
`