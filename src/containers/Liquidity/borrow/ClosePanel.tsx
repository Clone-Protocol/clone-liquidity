import React from 'react'
import { Box, Stack, Typography, styled } from '@mui/material'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import Image from 'next/image'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { SubmitButton } from "~/components/Common/CommonButtons"
import CheckIcon from 'public/images/check-icon.svg'
import { ON_USD } from '~/utils/constants'

const ClosePanel = ({ borrowDetail, onMoveRepayPosition, onMoveWithdrawCollateral }: { borrowDetail: BorrowDetail, onMoveRepayPosition: () => void, onMoveWithdrawCollateral: () => void }) => {
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
            {borrowDetail.collateralAmount.toLocaleString()} {ON_USD}
          </Typography>

          <GoButton onClick={onMoveWithdrawCollateral} disabled={!canCloseComet}><Typography variant="p" noWrap>{canCloseComet ? 'Withdraw Collateral' : 'Complete Step 1'}</Typography></GoButton>
        </StackWithBorder>
      </Box>
    </>
  )
}

const StackWithBorder = styled(Stack)`
  width: 100%;
  height: 52px;
  margin-top: 10px;
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
