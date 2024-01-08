import React, { useMemo, useState } from 'react';
import { Box, Typography, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { LoadingProgress } from '~/components/Common/Loading'
import { useBalanceQuery } from '~/features/Overview/Balance.query'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { useSnackbar } from 'notistack'
import withSuspense from '~/hocs/withSuspense'
import { shortenAddress } from '~/utils/address'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getSolInBalance } from '~/utils/address';
import { ON_USD } from '~/utils/constants';
import { useSetAtom } from 'jotai'
import { cloneClient } from '~/features/globalAtom'
import { useClone } from '~/hooks/useClone';

const WalletSelectBox = ({ show, onHide }: { show: boolean, onHide: () => void }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { getCloneApp } = useClone()
  const wallet = useAnchorWallet()
  const { publicKey, disconnect } = useWallet()
  const [solBalance, setSolBalance] = useState(0)
  const setCloneClient = useSetAtom(cloneClient)

  const { data: balance } = useBalanceQuery({
    userPubKey: publicKey,
    refetchOnMount: 'always',
    enabled: publicKey != null
  })

  useMemo(() => {
    const getBalance = async () => {
      if (publicKey && wallet && show) {
        try {
          const program = await getCloneApp(wallet)
          const balance = await getSolInBalance(program, publicKey)
          setSolBalance(balance)
        } catch (e) {
          console.error(e)
        }
      }
    }
    getBalance()
  }, [show, publicKey])

  const handleDisconnect = async () => {
    setCloneClient(null)
    enqueueSnackbar('Wallet disconnected')
    await disconnect()
    onHide && onHide()
    // refresh page by force
    await setTimeout(() => {
      location.reload()
    }, 1000)
  }

  return show ? (
    <WalletWrapper>
      <Stack direction='row' justifyContent='space-between' alignItems='center' padding='13px'>
        <Box lineHeight={1}>
          <Box><Typography variant='p' fontWeight={600} color='#fff'>{solBalance.toLocaleString()} SOL</Typography></Box>
          {publicKey && (
            <Box><Typography variant='p' color='#c5c7d9'>{shortenAddress(publicKey.toString())}</Typography></Box>
          )}
        </Box>
        <Stack direction='row' spacing={1}>
          <CopyToClipboard text={publicKey!!.toString()}
            onCopy={() => enqueueSnackbar('Wallet address copied')}>
            <PopupButton><Typography variant='p_sm'>Copy</Typography></PopupButton>
          </CopyToClipboard>
          <PopupButton><Typography variant='p_sm' onClick={handleDisconnect}>Disconnect</Typography></PopupButton>
        </Stack>
      </Stack>
      <AssetBox>
        <Typography variant='h3'>${balance?.onusdVal.toLocaleString()}</Typography> <Typography variant='p_lg'>{ON_USD}</Typography>
      </AssetBox>
    </WalletWrapper >
  ) : <></>
}

export default withSuspense(WalletSelectBox, <LoadingProgress />)

const WalletWrapper = styled(Stack)`
	position: absolute;
	top: 70px;
	right: 0px;
	width: 283px;
	background-color: ${(props) => props.theme.basis.darkNavy};
	border-radius: 5px;
  border: solid 1px ${(props) => props.theme.basis.shadowGloom};
	z-index: 99;
`
const PopupButton = styled(Box)`
	font-size: 10px;
	font-weight: 600;
	color: #fff;
	padding: 2px 6px;
	border-radius: 100px;
  background-color: ${(props) => props.theme.basis.jurassicGrey};
	cursor: pointer;
  &:hover {
    background: transparent;
		box-shadow: 0 0 0 1px ${(props) => props.theme.basis.gloomyBlue};
	}
`
const AssetBox = styled(Box)`
	width: 100%;
	height: 61px;
	padding: 17px;
	display: flex;
  align-items: center;
	gap: 10px;
	color: #fff;
  border-radius: 5px;
	background-color: ${(props) => props.theme.basis.royalNavy};
`