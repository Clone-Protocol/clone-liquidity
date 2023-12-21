import React, { useState } from 'react'
import { Box, styled, Typography, Snackbar, CircularProgress, Stack } from '@mui/material'
import SuccessIcon from 'public/images/check-mark-icon.svg'
import FailureIcon from 'public/images/failure-mark-icon.svg'
import CloseIcon from 'public/images/close.svg'
import Image from 'next/image'
import { TransactionState } from '~/hooks/useTransactionState'
import Slide from '@mui/material/Slide';
import 'animate.css'
import { makeStyles } from '@mui/styles'

const getTxnURL = (txHash: string) => {
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
  const txStatusColor = isSuccess ? '#4fe5ff' : '#ff0084'
  return (<Stack direction='row' alignItems='center' paddingY='18px' gap={1} borderRadius='10px' sx={isSuccess ? { backgroundColor: '#000e22', border: '1px solid #4fe5ff' } : { backgroundColor: '#1a081c', border: '1px solid #ff0084' }}>
    <Image src={isSuccess ? SuccessIcon : FailureIcon} width={65} height={65} alt='icStatus' />
    <Box lineHeight={1}>
      <Box mt='6px'><Typography variant='p_xlg'>Transaction {isSuccess ? 'complete' : 'failed'}</Typography></Box>
      {!isSuccess && <Box mt='6px'><Typography variant='p' color='#66707e'>Something went wrong. Please try again.</Typography></Box>}
      <Box mt='6px' sx={{ textDecoration: 'underline', color: txStatusColor }}>
        <a href={isSuccess ? getTxnURL(txHash) : 'https://status.solana.com/'} target='_blank' rel="noreferrer"><Typography variant='p_sm' color={txStatusColor}>{isSuccess ? 'View Transaction' : 'Check Solana network status'}</Typography></a>
      </Box>
    </Box>
  </Stack>)
}

const useCircleStyles = makeStyles(() => ({
  circle: {
    stroke: "url(#linearColors)",
  },
}));


const ConfirmingWrapper = ({ txHash, isFocus }: { txHash: string, isFocus: boolean }) => {
  const classes = useCircleStyles({});
  const [longTimeStatus, setLongTimeStatus] = useState<JSX.Element>()
  const StatusWrap = (<LongTimeStatus><Typography variant='p'>This transaction is taking unusually long. Please check <br /> <a href='https://status.solana.com/' target='_blank' rel="noreferrer">Solana Network status</a></Typography></LongTimeStatus>)
  setTimeout(() => {
    setLongTimeStatus(StatusWrap)
  }, 15000)

  return (
    <ConfirmBoxWrapper className={isFocus ? 'animate__animated animate__shakeX' : ''}>
      <Stack direction='row' alignItems='center' spacing={2}>
        <svg width="8" height="6">
          <linearGradient id="linearColors" x1="0" y1="0" x2="1" y2="1">
            <stop offset="25%" stopColor="#6cb8ff" />
            <stop offset="90%" stopColor="rgba(0, 133, 255, 0)" />
          </linearGradient>
        </svg>
        <CircularProgress classes={{ circle: classes.circle }} size={56} thickness={5} />
        <Box>
          <Box><Typography variant='p_xlg'>Confirming transaction</Typography></Box>
          <Box mt='6px' lineHeight={1}><Typography variant='p' color={isFocus ? '#ff8e4f' : '#66707e'}>Transactions on Solana typically take about 5 seconds. </Typography></Box>
          <Box sx={{ textDecoration: 'underline', color: '#4fe5ff' }}><a href={getTxnURL(txHash)} target='_blank' rel="noreferrer"><Typography variant='p_sm' color='#4fe5ff'>View Transaction</Typography></a></Box>
        </Box>
      </Stack>
      {longTimeStatus}
    </ConfirmBoxWrapper>
  )
}

const TransactionStateSnackbar = ({ txState, txHash, open, handleClose }: { txState: TransactionState, txHash: string, open: boolean, handleClose: () => void }) => {
  const [isFocusWarning, setIsFocusWarning] = useState(false)

  return (
    <Box zIndex={999999}>
      {txState === TransactionState.PENDING && <BackLayer onClick={() => setIsFocusWarning(true)} />}
      <Slide direction="left" in={true} mountOnEnter unmountOnExit>
        <Snackbar open={open} autoHideDuration={60000} onClose={txState === TransactionState.PENDING ? () => { } : handleClose}>
          <Box>
            {txState === TransactionState.SUCCESS &&
              <BoxWrapper>
                <CloseButton onClick={handleClose}><Image src={CloseIcon} alt='close' /></CloseButton>
                <SuccessFailureWrapper isSuccess={true} txHash={txHash} />
              </BoxWrapper>
            }
            {txState === TransactionState.FAIL &&
              <BoxWrapper>
                <CloseButton onClick={handleClose}><Image src={CloseIcon} alt='close' /></CloseButton>
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
  width: 419px;
`
const CloseButton = styled(Box)`
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
`

const ConfirmBoxWrapper = styled(Box)`
  width: 442px;
  border-radius: 10px;
  padding: 18px 10px;
  background: ${(props) => props.theme.basis.darkNavy};
  border: 1px solid ${(props) => props.theme.basis.shadowGloom};
`
const LongTimeStatus = styled(Box)`
  padding: 12px 25px;
  color: ${(props) => props.theme.basis.warningOrange};
  margin-top: 13px;
  border-radius: 5px;
  background-color: rgba(255, 141, 78, 0.1);
  line-height: 1;
  a {
    color: ${(props) => props.theme.basis.warningOrange};
    text-decoration: underline;
  }
`

export default TransactionStateSnackbar

