import React, { useState } from 'react'
import { Box, styled, Typography, Snackbar, CircularProgress } from '@mui/material'
import SuccessIcon from 'public/images/check-mark-icon.svg'
import FailureIcon from 'public/images/failure-mark-icon.svg'
import CloseIcon from 'public/images/close.svg'
import Image from 'next/image'
import { TransactionState } from '~/hooks/useTransactionState'
import Slide from '@mui/material/Slide';
import 'animate.css'

const getTxnURL = (txHash: string) => {
  // NOTE: Was having issues setting up the URL for Solscan,
  // using SolanaFM instead.

  let cluster = (() => {
    let network = process.env.NEXT_PUBLIC_USE_NETWORK;
    if (network === "DEV_NET") {
      return 'devnet-qn1'
    }
    if (network === "MAIN_NET") {
      return 'mainnet-qn1'
    }
    throw new Error(`Network ${network} not yet supported!`)
  })();

  return `https://solana.fm/tx/${txHash}?cluster=${cluster}`
}

const SuccessFailureWrapper = ({ isSuccess, txHash }: { isSuccess: boolean, txHash: string }) => {
  return (<Box>
    <Box mt='10px'><Image src={isSuccess ? SuccessIcon : FailureIcon} width='47px' height='47px' /></Box>
    <Box mt='10px'><Typography variant='h7'>Transaction {isSuccess ? 'complete' : 'failed'}</Typography></Box>
    <Box my='10px'>
      <Typography variant='p' color='#989898'>
        {isSuccess ? 'You can now access all features.' : 'There was an error. Please try again.'}
      </Typography>
    </Box>
    <Box mb='10px' sx={{ textDecoration: 'underline', color: '#258ded' }}><a href={getTxnURL(txHash)} target='_blank' rel="noreferrer"><Typography variant='p' color='#258ded'>View Transaction</Typography></a></Box>
  </Box>)
}

const ConfirmingWrapper = ({ txHash, isFocus }: { txHash: string, isFocus: boolean }) => {
  const [longTimeStatus, setLongTimeStatus] = useState<JSX.Element>()
  const StatusWrap = (<LongTimeStatus><Typography variant='p'>This transaction is taking unusually long. Please check <br /> <a href='https://status.solana.com/' target='_blank' rel="noreferrer">Solana Network status</a></Typography></LongTimeStatus>)
  setTimeout(() => {
    setLongTimeStatus(StatusWrap)
  }, 15000)

  return (
    <ConfirmBoxWrapper className={isFocus ? 'animate__animated animate__shakeX' : ''}>
      <CircularProgress sx={{ color: '#fff' }} size={23} thickness={8} />
      <Box mt='10px'><Typography variant='h7'>Confirming transaction</Typography></Box>
      <Box my='10px' lineHeight={1}><Typography variant='p' color={isFocus ? '#ff8e4f' : '#989898'}>All features are disabled until the transaction is confirmed.
        <br />Transactions on Solana typically take an average of 5 seconds. </Typography></Box>
      <Box sx={{ textDecoration: 'underline', color: '#258ded' }}><a href={getTxnURL(txHash)} target='_blank' rel="noreferrer"><Typography variant='p' color='#258ded'>View Transaction</Typography></a></Box>
      {longTimeStatus}
    </ConfirmBoxWrapper>
  )
}

const TransactionStateSnackbar = ({ txState, txHash, open, handleClose }: { txState: TransactionState, txHash: string, open: boolean, handleClose: () => void }) => {
  const [isFocusWarning, setIsFocusWarning] = useState(false)

  console.log('txState', txState)

  return (
    <Box zIndex={999999}>
      {txState === TransactionState.PENDING && <BackLayer onClick={() => setIsFocusWarning(true)} />}
      <Slide direction="left" in={true} mountOnEnter unmountOnExit>
        <Snackbar open={open} autoHideDuration={60000} onClose={txState === TransactionState.PENDING ? () => { } : handleClose}>
          <Box>
            {txState === TransactionState.SUCCESS &&
              <BoxWrapper>
                <CloseButton onClick={handleClose}><Image src={CloseIcon} /></CloseButton>
                <SuccessFailureWrapper isSuccess={true} txHash={txHash} />
              </BoxWrapper>
            }
            {txState === TransactionState.FAIL &&
              <BoxWrapper>
                <CloseButton onClick={handleClose}><Image src={CloseIcon} /></CloseButton>
                <SuccessFailureWrapper isSuccess={false} txHash={txHash} />
              </BoxWrapper>
            }
            {txState === TransactionState.PENDING &&
              <ConfirmingWrapper txHash={txHash} isFocus={isFocusWarning} />
            }
          </Box>
        </Snackbar>
      </Slide>
    </Box>
  )
}

const BackLayer = styled('div')`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: transparent;
`

const BoxWrapper = styled(Box)`
  width: 236px;
  text-align: center;
  border-radius: 15px;
  padding: 12px;
  background: ${(props) => props.theme.boxes.black};
`
const CloseButton = styled(Box)`
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
`

const ConfirmBoxWrapper = styled(Box)`
  width: 442px;
  border-radius: 15px;
  padding: 15px 32px;
  background: ${(props) => props.theme.boxes.black};
`
const LongTimeStatus = styled(Box)`
  padding: 12px 18px;
  color: ${(props) => props.theme.palette.warning.main};
  border: solid 1px ${(props) => props.theme.palette.warning.main};
  margin-top: 13px;
  line-height: 0.8;
  a {
    color: ${(props) => props.theme.palette.warning.main};
    text-decoration: underline;
  }
`

export default TransactionStateSnackbar

