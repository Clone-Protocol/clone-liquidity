import React, { useState } from 'react'
import { Box, Stack, Button, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as BorrowDetail } from '~/features/MyLiquidity/BorrowPosition.query'
import { useCloseMutation } from '~/features/Borrow/Borrow.mutation'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import WarningIcon from 'public/images/warning-icon.png'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'

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
            enqueueSnackbar('Successfully closed position')
            setLoading(false)
            router.push('/liquidity?ltab=2')
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
            <Box><Typography variant='p_lg' color='#989898'>{borrowDetail.borrowedIasset.toLocaleString(undefined, { maximumFractionDigits: 5 })} {borrowDetail.tickerSymbol}</Typography></Box>
          </Stack>
          <Stack direction="row" justifyContent="space-between" mt='15px'>
            <Box><Typography variant='p_lg' color='#989898'>Borrowed iAsset Wallet Balance</Typography></Box>
            <Box><Typography variant='p_lg' color='#989898'>{borrowDetail.iassetVal.toLocaleString(undefined, { maximumFractionDigits: 5 })} {borrowDetail.tickerSymbol}</Typography></Box>
          </Stack>
          <Stack direction="row" justifyContent="space-between" mt='15px'>
            <Box><Typography variant='p_lg'>Withdraw-able Collateral</Typography></Box>
            <Box><Typography variant='p_lg'>{borrowDetail.collateralAmount.toLocaleString()} USDi</Typography></Box>
          </Stack>
        </Box>

        <ActionButton onClick={onClose} disabled={!canCloseComet}>Withdraw all Collateral & Close Position</ActionButton>

        <Box display='flex' justifyContent='center'>
          <DataLoadingIndicator />
        </Box>

        {!canCloseComet &&
          <WarningStack direction="row">
            <WarningIconBox>
              <Image src={WarningIcon} />
            </WarningIconBox>
            <WarningBox>
              Not enough wallet balance to repay.
            </WarningBox>
          </WarningStack>
        }
      </Box>
    </>
  )
}

const ActionButton = styled(Button)`
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: ${(props) => props.theme.palette.primary.main};
  color: #000;
  border-radius: 0px;
  margin-top: 15px;
  margin-bottom: 15px;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: ${(props) => props.theme.boxes.grey};
    color: #000;
  }
`
const WarningStack = styled(Stack)`
  background: rgba(233, 209, 0, 0.04);
  border: 1px solid #e9d100;
  border-radius: 10px;
  color: #9d9d9d;
  padding: 8px;
  margin-top: 10px;
  margin-bottom: 30px;
`
const WarningIconBox = styled(Box)`
  width: 53px; 
  margin-left: 20px; 
  text-align: center;
`
const WarningBox = styled(Box)`
	max-width: 300px;
  padding-left: 36px;
  padding-top: 4px;
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
`

export default withSuspense(ClosePanel, <LoadingProgress />)
