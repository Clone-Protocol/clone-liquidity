import React, { useState } from 'react'
import { Box, Stack, Button } from '@mui/material'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import { useCloseMutation } from '~/features/Borrow/Borrow.mutation'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'

const ClosePanel = ({ assetId, borrowDetail }: { assetId: string, borrowDetail: BorrowDetail }) => {
	const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
	const borrowIndex = parseInt(assetId)

  const { mutateAsync } = useCloseMutation(publicKey)

	const onClose = async () => {
    setLoading(true)
    await mutateAsync(
      {
        borrowIndex
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to close')
            setLoading(false)
            router.push('/liquidity?ltab=2')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to close')
          setLoading(false)
        }
      }
    )
	}

  const canCloseComet = borrowDetail.iassetVal >= borrowDetail.borrowedIasset

	return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Box sx={{ padding: '30px', background: 'rgba(21, 22, 24, 0.75)', borderRadius: '10px', marginTop: '17px' }}>
        <Title>Close Borrow Position</Title>

        <Box sx={{ borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '11px 24px 9px 27px'}}>
          <Stack direction="row" justifyContent="space-between">
            <DetailHeader>Dept Amount</DetailHeader>
            <DetailValue>{borrowDetail.borrowedIasset.toLocaleString()} {borrowDetail.tickerSymbol}</DetailValue>
          </Stack>
          <Stack sx={{ marginTop: '10px' }} direction="row" justifyContent="space-between">
            <DetailHeader>Indepted Asset Wallet Balance</DetailHeader>
            <DetailValue>{borrowDetail.iassetVal.toLocaleString()} {borrowDetail.tickerSymbol}</DetailValue>
          </Stack>
          <Stack sx={{ marginTop: '10px' }} direction="row" justifyContent="space-between">
            <DetailHeader>Collateral</DetailHeader>
            <DetailValue>{borrowDetail.collateralAmount.toLocaleString()} USDi</DetailValue>
          </Stack>
        </Box>
        <Box sx={{ padding: '0px 20px 9px 17px' }}>
          <Stack sx={{ marginTop: '15px' }} direction="row" justifyContent="space-between">
            <DetailHeader>Collateral Withdraw</DetailHeader>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{borrowDetail.collateralAmount.toLocaleString()} USDi</div>
          </Stack>
        </Box>
        
        <ActionButton onClick={onClose} disabled={!canCloseComet}>Repay & Close Position</ActionButton>
      </Box>
    </>
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

const ActionButton = styled(Button)`
  width: 100%;
  background: #4e609f;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 12px;
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

export default withSuspense(ClosePanel, <LoadingProgress />)
