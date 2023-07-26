import React, { useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import InfoIcon from 'public/images/info-icon-black.svg'
import { useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import { useCloseMutation } from '~/features/Borrow/Borrow.mutation'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { SubmitButton } from '~/components/Common/CommonButtons'
import { MARKETS_APP } from '~/data/social'
import { TAB_BORROW } from '../LiquidityTable'

const ClosePanel = ({ assetId, borrowDetail }: { assetId: string, borrowDetail: BorrowDetail }) => {
  const { publicKey } = useWallet()
  const router = useRouter()
  const borrowIndex = parseInt(assetId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { mutateAsync } = useCloseMutation(publicKey)

  const redirectToMarket = () => {
    const url = `${MARKETS_APP}`
    window.open(url)
  }

  const onClose = async () => {
    try {
      setIsSubmitting(true)
      const data = await mutateAsync(
        {
          borrowIndex
        }
      )
      if (data) {
        console.log('data', data)
        router.replace(`/myliquidity?ltab=${TAB_BORROW}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canCloseComet = Number(borrowDetail.iassetVal) >= Number(borrowDetail.borrowedIasset)

  return (
    <>
      <Box padding='15px'>
        <Box mb='15px'>
          <Stack direction="row" justifyContent="space-between" mt='5px'>
            <Box><Typography variant='p_lg' color='#989898'>Borrowed Amount</Typography></Box>
            <Box><Typography variant='p_lg' color={canCloseComet ? '#989898' : '#ed2525'}>{borrowDetail.borrowedIasset.toLocaleString(undefined, { maximumFractionDigits: 5 })} {borrowDetail.tickerSymbol}</Typography></Box>
          </Stack>
          <Stack direction="row" justifyContent="space-between" mt='15px'>
            <Box><Typography variant='p_lg' color='#989898'>Borrowed onAsset Wallet Balance</Typography></Box>
            <Box><Typography variant='p_lg' color={canCloseComet ? '#989898' : '#ed2525'}>{borrowDetail.iassetVal.toLocaleString(undefined, { maximumFractionDigits: 5 })} {borrowDetail.tickerSymbol}</Typography></Box>
          </Stack>
          {!canCloseComet && <Box textAlign='right'><Typography variant='p' color='#ed2525'>onAsset Wallet Balance must be greater than Borrowed Amount</Typography></Box>}
          <Stack direction="row" justifyContent="space-between" mt='15px'>
            <Box><Typography variant='p_lg'>Withdraw-able Collateral</Typography></Box>
            <Box><Typography variant='p_lg'>{borrowDetail.collateralAmount.toLocaleString()} onUSD</Typography></Box>
          </Stack>
        </Box>

        {!canCloseComet &&
          <SubmitButton onClick={redirectToMarket}><Image src={InfoIcon} alt='info' /> <Typography variant='p' ml='5px' sx={{ cursor: 'pointer' }}>Click here to go to Clone Markets to acquire this onAsset</Typography></SubmitButton>
        }
        <SubmitButton onClick={onClose} disabled={isSubmitting || !canCloseComet} sx={{ marginTop: '2px' }}><Typography variant='p_lg'>Withdraw all Collateral & Close Position</Typography></SubmitButton>
      </Box>
    </>
  )
}

export default withSuspense(ClosePanel, <LoadingProgress />)
