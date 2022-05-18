import React, { useState } from 'react'
import { Grid, Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import PositionInfo from '~/components/Liquidity/borrow/PositionInfo'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useBorrowPositionQuery } from '~/features/MyLiquidity/BorrowPosition.query'
import { useCloseMutation } from '~/features/Borrow/Borrow.mutation'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'

const ClosePanel = ({ assetId }: { assetId: string }) => {
	const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
	const borrowIndex = parseInt(assetId)

  const { data: positionInfo } = useBorrowPositionQuery({ 
    userPubKey: publicKey, 
    index: borrowIndex,
    refetchOnMount: true,
    enabled: publicKey != null
  });
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

	return (
    <>
      {loading && (
				<LoadingWrapper>
					<LoadingIndicator open inline />
				</LoadingWrapper>
			)}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <PositionInfo positionInfo={positionInfo} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ padding: '30px' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ marginBottom: '15px' }}>
              <DetailHeader>Repay-Burn amount</DetailHeader>
              <DetailValue>
                {positionInfo?.borrowedIasset} {positionInfo?.tickerSymbol}
              </DetailValue>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <DetailHeader>Withdraw amount</DetailHeader>
              <DetailValue>{positionInfo?.collateralAmount} USDi</DetailValue>
            </Stack>
            <StyledDivider />
            <ActionButton onClick={onClose}>Close</ActionButton>
          </Box>
        </Grid>
      </Grid>
    </>
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
	font-size: 18px;
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
  &:disabled {
    background-color: #444;
    color: #adadad;
  } 
`

export default withSuspense(ClosePanel, <LoadingProgress />)
