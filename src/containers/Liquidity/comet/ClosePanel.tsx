import { Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCloseMutation } from '~/features/Comet/Comet.mutation'
import { CometDetail } from '~/features/MyLiquidity/CometPosition.query'

const ClosePanel = ({ assetId, cometDetail }: { assetId: string, cometDetail: CometDetail }) => {
	const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  const { mutateAsync } = useCloseMutation(publicKey)

	const cometIndex = parseInt(assetId)

	const onClose = async () => {
    await mutateAsync(
      {
        cometIndex
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to close comet')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to close comet')
        }
      }
    )
	}

	return (
    <Box sx={{ padding: '30px', background: 'rgba(21, 22, 24, 0.75)', borderRadius: '10px', marginTop: '17px' }}>
      <Title>Close Comet</Title>
      <Box sx={{ borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '11px 24px 9px 27px'}}>
        <Stack direction="row" justifyContent="space-between">
          <DetailHeader>Collateral</DetailHeader>
          <DetailValue>{cometDetail.collAmount.toLocaleString()} USDi</DetailValue>
        </Stack>
        <Stack sx={{ marginTop: '10px' }} direction="row" justifyContent="space-between">
          <DetailHeader>ILD</DetailHeader>
          <DetailValue>{cometDetail.ild.toLocaleString()} USDi</DetailValue>
        </Stack>
      </Box>
      <Box sx={{ padding: '0px 24px 9px 27px' }}>
        <Stack sx={{ marginTop: '15px' }} direction="row" justifyContent="space-between">
          <DetailHeader>Total withdraw</DetailHeader>
          <DetailValue>{cometDetail.collAmount.toLocaleString()} - {cometDetail.ild.toLocaleString()} =</DetailValue>
        </Stack>
        <Stack direction="row" justifyContent="flex-end">
          <TotalWithdraw>{(cometDetail.collAmount - cometDetail.ild).toLocaleString()} USDi</TotalWithdraw>
        </Stack>
      </Box>
      
      <ActionButton onClick={onClose}>Close Comet</ActionButton>
    </Box>
	)
}

const Title = styled('div')`
	font-size: 16px;
	font-weight: 600;
	color: #fff;
  margin-left: 15px;
	margin-bottom: 15px;
`

const DetailHeader = styled('div')`
	font-size: 12px;
	font-weight: 600;
	color: #989898;
`

const DetailValue = styled('div')`
	font-size: 11px;
	font-weight: 500;
	color: #9a9a9a;
`

const TotalWithdraw = styled(Box)`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
`

const ActionButton = styled(Button)`
  width: 100%;
  background: #4e609f;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 22px;
`

export default ClosePanel
