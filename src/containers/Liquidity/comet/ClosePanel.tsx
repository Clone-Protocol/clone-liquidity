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
    <Box sx={{ padding: '30px' }}>
      <Stack direction="row" justifyContent="space-between">
        <DetailHeader>Collateral</DetailHeader>
        <DetailValue>{cometDetail.collAmount} USDi</DetailValue>
      </Stack>
      <Stack sx={{ marginTop: '10px' }} direction="row" justifyContent="space-between">
        <DetailHeader>ILD</DetailHeader>
        <DetailValue>{cometDetail.ild} USDi</DetailValue>
      </Stack>
      <Stack sx={{ marginTop: '30px' }} direction="row" justifyContent="space-between">
        <DetailHeader>Withdraw amount</DetailHeader>
        <DetailValue>{cometDetail.collAmount - cometDetail.ild} USDi</DetailValue>
      </Stack>
      <StyledDivider />
      <ActionButton onClick={onClose}>Close</ActionButton>
    </Box>
	)
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 39px;
	margin-top: 39px;
	height: 1px;
`

const DetailHeader = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #989898;
`

const DetailValue = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #fff;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #7d7d7d;
	color: #fff;
	border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
	margin-bottom: 15px;
`

export default ClosePanel
