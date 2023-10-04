import React, { useState } from 'react'
import { Box, Stack, Typography, styled } from '@mui/material'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import InfoIcon from 'public/images/info-icon-black.svg'
import { useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import { useCloseMutation } from '~/features/Borrow/Borrow.mutation'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { MARKETS_APP } from '~/data/social'
import { TAB_BORROW } from '../LiquidityTable'
import { SubmitButton } from "~/components/Common/CommonButtons"
import CheckIcon from 'public/images/check-icon.svg'

const ClosePanel = ({ assetId, borrowDetail, onMoveRepayPosition }: { assetId: string, borrowDetail: BorrowDetail, onMoveRepayPosition: () => void }) => {
  const { publicKey } = useWallet()
  const router = useRouter()
  const borrowIndex = parseInt(assetId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { mutateAsync } = useCloseMutation(publicKey)

  // const redirectToMarket = () => {
  //   const url = `${MARKETS_APP}`
  //   window.open(url)
  // }

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
        router.replace(`/comet/myliquidity?ltab=${TAB_BORROW}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canCloseComet = borrowDetail.borrowedOnasset === 0  //Number(borrowDetail.iassetVal) >= Number(borrowDetail.borrowedOnasset)

  return (
    <>
      <Box mt='24px'>
        <Box>
          <Typography variant='p_lg'>Step 1: Repay full borrowed amount</Typography>
          <InfoTooltip title={TooltipTexts.rewards} color="#66707e" />
        </Box>
        <StackWithBorder direction='row' justifyContent='space-between'>
          <Typography variant='p_lg'>
            {borrowDetail.borrowedOnasset.toLocaleString(undefined, { maximumFractionDigits: 5 })} {borrowDetail.tickerSymbol}
          </Typography>

          {canCloseComet ?
            <Stack direction='row' gap={1} alignItems='center'>
              <Image src={CheckIcon} alt='check' />
              <Typography variant="p">None Remaining</Typography>
            </Stack>
            :
            <GoButton onClick={onMoveRepayPosition}><Typography variant="p">Repay</Typography></GoButton>
          }
        </StackWithBorder>
      </Box>

      <Box>
        <Box>
          <Typography variant='p_lg'>Step 2 (Final Step): Withdraw entire collateral</Typography>
          <InfoTooltip title={TooltipTexts.rewards} color="#66707e" />
        </Box>
        <StackWithBorder direction='row' justifyContent='space-between'>
          <Typography variant='p_lg'>
            {borrowDetail.collateralAmount.toLocaleString()} onUSD
          </Typography>

          <GoButton onClick={onClose} disabled={isSubmitting || !canCloseComet}><Typography variant="p" noWrap>{canCloseComet ? 'Withdraw Collateral' : 'Complete Step 1'}</Typography></GoButton>
        </StackWithBorder>
      </Box>

      {/* <Box mb='15px'>
        <Stack direction="row" justifyContent="space-between" mt='5px'>
          <Box><Typography variant='p_lg' color='#989898'>Borrowed Amount</Typography></Box>
          <Box><Typography variant='p_lg' color={canCloseComet ? '#989898' : '#ed2525'}>{borrowDetail.borrowedOnasset.toLocaleString(undefined, { maximumFractionDigits: 5 })} {borrowDetail.tickerSymbol}</Typography></Box>
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
      </Box> */}

      {/* {!canCloseComet &&
        <SubmitButton onClick={redirectToMarket}><Image src={InfoIcon} alt='info' /> <Typography variant='p' ml='5px' sx={{ cursor: 'pointer' }}>Click here to go to Clone Markets to acquire this onAsset</Typography></SubmitButton>
      }
      <SubmitButton onClick={onClose} disabled={isSubmitting || !canCloseComet} sx={{ marginTop: '2px' }}><Typography variant='p_lg'>Withdraw all Collateral & Close Position</Typography></SubmitButton> */}
    </>
  )
}

const StackWithBorder = styled(Stack)`
  width: 100%;
  height: 52px;
  margin-top: 15px;
  margin-bottom: 38px;
  border-radius: 5px;
  align-items: center;
  gap: 10px;
  padding: 18px 21px;
  border: solid 1px ${(props) => props.theme.basis.jurassicGrey};
`
const GoButton = styled(SubmitButton)`
  width: 180px;
  height: 40px;
`

export default withSuspense(ClosePanel, <LoadingProgress />)
