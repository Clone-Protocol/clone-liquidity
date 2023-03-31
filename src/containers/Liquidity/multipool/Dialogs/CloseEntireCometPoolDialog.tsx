// @deprecated
import React, { useState } from 'react'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { Box, styled, Dialog, DialogContent, Typography } from '@mui/material'
import { FadeTransition } from '~/components/Common/Dialog'
import { StyledDivider } from '~/components/Common/StyledDivider'
import { useCloseAllPositionMutation } from '~/features/MyLiquidity/multipool/LiquidityPosition.mutation'
import { SubmitButton } from '~/components/Common/CommonButtons'

const CloseEntireCometPoolDialog = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const { mutateAsync } = useCloseAllPositionMutation(publicKey)

  const handleEntireCloseComet = async () => {
    setLoading(true)
    await mutateAsync(
      {},
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Successfully close entire multipool comet positions')
            handleClose()
            //hacky sync
            location.reload()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to recenter position : No price deviation detected.')
          setLoading(false)
        }
      }
    )
  }

  return (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}

      <Dialog open={open} onClose={handleClose} TransitionComponent={FadeTransition} maxWidth={390}>
        <DialogContent sx={{ backgroundColor: '#16171a', padding: '15px 15px' }}>
          <BoxWrapper>
            <Typography variant='p_xlg'>Close Entire Multipool Comet</Typography>
            <StyledDivider />

            <Box lineHeight={1}>
              <Box><Typography variant='p'>This workflow is designed to trigger:</Typography></Box>
              <Box><Typography variant='p' color='#989898'>- withdrawal of all multipool liquidity positions</Typography></Box>
              <Box><Typography variant='p' color='#989898'>- settlement of all ILD debts</Typography></Box>
              <Box><Typography variant='p' color='#989898'>- withdrawal of all remaining multipool deposit</Typography></Box>
            </Box>

            <WarningBox>
              <Typography variant='h8'>Please read: </Typography><Typography variant='p'>this workflow will prompt multiple transaction approvals in series. Please approval all transaction requests to ensure successful completion of the work flow.</Typography>
            </WarningBox>

            <SubmitButton onClick={() => handleEntireCloseComet()}>
              <Typography variant='p_lg'>Close Entire Multipool</Typography>
            </SubmitButton>
          </BoxWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}


const BoxWrapper = styled(Box)`
  width: 390px;
  padding: 2px 15px; 
  color: #fff;
`
const WarningBox = styled(Box)`
  padding: 9px 13px;
  color: ${(props) => props.theme.palette.warning.main};
  border: solid 1px ${(props) => props.theme.palette.warning.main};
  margin-top: 13px;
  line-height: 1;
`

export default CloseEntireCometPoolDialog

