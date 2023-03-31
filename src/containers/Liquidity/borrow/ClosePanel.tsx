import React, { useState } from 'react'
import { Box, Stack, Button, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
import Image from 'next/image'
import InfoIcon from 'public/images/info-icon-black.svg'
import { useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import { useCloseMutation } from '~/features/Borrow/Borrow.mutation'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { SubmitButton } from '~/components/Common/CommonButtons'

const ClosePanel = ({ assetId, borrowDetail }: { assetId: string, borrowDetail: BorrowDetail }) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const borrowIndex = parseInt(assetId)

  const { mutateAsync } = useCloseMutation(publicKey)

  const redirectToMarket = () => {
    //TODO: set market url for route
  }

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
            enqueueSnackbar('Successfully closed position')
            setLoading(false)
            router.push('/liquidity?ltab=3')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Error closing position')
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

      <Box padding='15px'>
        <Box>
          <Stack direction="row" justifyContent="space-between" mt='5px'>
            <Box><Typography variant='p_lg' color='#989898'>Borrowed Amount</Typography></Box>
            <Box><Typography variant='p_lg' color={canCloseComet ? '#989898' : '#ed2525'}>{borrowDetail.borrowedIasset.toLocaleString(undefined, { maximumFractionDigits: 5 })} {borrowDetail.tickerSymbol}</Typography></Box>
          </Stack>
          <Stack direction="row" justifyContent="space-between" mt='15px'>
            <Box><Typography variant='p_lg' color='#989898'>Borrowed iAsset Wallet Balance</Typography></Box>
            <Box><Typography variant='p_lg' color={canCloseComet ? '#989898' : '#ed2525'}>{borrowDetail.iassetVal.toLocaleString(undefined, { maximumFractionDigits: 5 })} {borrowDetail.tickerSymbol}</Typography></Box>
          </Stack>
          {!canCloseComet && <Box textAlign='right'><Typography variant='p' color='#ed2525'>iAsset Wallet Balance must be greater than Borrowed Amount</Typography></Box>}
          <Stack direction="row" justifyContent="space-between" mt='15px'>
            <Box><Typography variant='p_lg'>Withdraw-able Collateral</Typography></Box>
            <Box><Typography variant='p_lg'>{borrowDetail.collateralAmount.toLocaleString()} USDi</Typography></Box>
          </Stack>
        </Box>

        {!canCloseComet &&
          <SubmitButton onClick={redirectToMarket}><Image src={InfoIcon} /> <Typography variant='p' ml='5px' sx={{ cursor: 'pointer' }}>Click here to go to Incept Markets to acquire this iAsset</Typography></SubmitButton>
        }
        <SubmitButton onClick={onClose} disabled={!canCloseComet} sx={{ marginTop: '2px' }}><Typography variant='p_lg'>Withdraw all Collateral & Close Position</Typography></SubmitButton>

        <Box display='flex' justifyContent='center'>
          <DataLoadingIndicator />
        </Box>
      </Box>
    </>
  )
}

export default withSuspense(ClosePanel, <LoadingProgress />)
