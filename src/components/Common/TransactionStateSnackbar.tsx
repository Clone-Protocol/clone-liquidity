import React, { useState } from 'react'
import { Box, styled, Typography, Snackbar, CircularProgress } from '@mui/material'
import SuccessIcon from 'public/images/check-mark-icon.svg'
import FailureIcon from 'public/images/failure-mark-icon.svg'
import CloseIcon from 'public/images/close.svg'
import Image from 'next/image'
import { TransactionState } from '~/hooks/useTransactionState'
import 'animate.css'

const SuccessFailureWrapper = ({ isSuccess, txHash }: { isSuccess: boolean, txHash: string }) => {
  return (<Box>
    <Box mt='10px'><Image src={isSuccess ? SuccessIcon : FailureIcon} width='47px' height='47px' /></Box>
    <Box mt='10px'><Typography variant='h7'>Transaction {isSuccess ? 'complete' : 'failed'}</Typography></Box>
    <Box my='10px'>
      <Typography variant='p' color='#989898'>
        {isSuccess ? 'You can now access all features.' : 'There was an error. Please try again.'}
      </Typography>
    </Box>
    <Box mb='10px' sx={{ textDecoration: 'underline', color: '#258ded' }}><a href={`https://solscan.io/tx/${txHash}`} target='_blank' rel="noreferrer"><Typography variant='p' color='#258ded'>View Transaction</Typography></a></Box>
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
      <Box sx={{ textDecoration: 'underline', color: '#258ded' }}><a href={`https://solscan.io/tx/${txHash}`} target='_blank' rel="noreferrer"><Typography variant='p' color='#258ded'>View Transaction</Typography></a></Box>
      {longTimeStatus}
    </ConfirmBoxWrapper>
  )
}

const TransactionStateSnackbar = ({ txState, txHash, open, handleClose }: { txState: TransactionState, txHash: string, open: boolean, handleClose: () => void }) => {
  const [isFocusWarning, setIsFocusWarning] = useState(false)

  return (
    <>
      {txState === TransactionState.PENDING && <BackLayer onClick={() => setIsFocusWarning(true)} />}
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
    </>
  )
}

const BackLayer = styled('div')`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(255,255,255,0.1);
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

