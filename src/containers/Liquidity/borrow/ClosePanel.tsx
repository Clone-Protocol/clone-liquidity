import React, { useState } from 'react'
import { Box, Stack, Button } from '@mui/material'
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
import InfoTooltip from '~/components/Common/InfoTooltip'

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

      <Wrapper>
        <Title>Close Borrow Position</Title>

        <PositionWrapper>
          <Stack direction="row" justifyContent="space-between">
            <DetailHeader>Dept Amount <InfoTooltip title="dept amount" /></DetailHeader>
            <DetailValue>{borrowDetail.borrowedIasset.toLocaleString(undefined, { maximumFractionDigits: 5 })} {borrowDetail.tickerSymbol}</DetailValue>
          </Stack>
          <Stack marginTop='10px' direction="row" justifyContent="space-between">
            <DetailHeader>Indepted Asset Wallet Balance <InfoTooltip title="indepted asset wallet balance" /></DetailHeader>
            <DetailValue>{borrowDetail.iassetVal.toLocaleString(undefined, { maximumFractionDigits: 5 })} {borrowDetail.tickerSymbol}</DetailValue>
          </Stack>
          <Stack marginTop='10px' direction="row" justifyContent="space-between">
            <DetailHeader>Collateral <InfoTooltip title="collateral" /></DetailHeader>
            <DetailValue>{borrowDetail.collateralAmount.toLocaleString()} USDi</DetailValue>
          </Stack>
        </PositionWrapper>
        <Box padding='0px 20px 9px 17px'>
          <Stack marginTop='15px' direction="row" justifyContent="space-between">
            <DetailHeader>Collateral Withdraw <InfoTooltip title="collateral withdraw" /></DetailHeader>
            <CollWithdrawValue>{borrowDetail.collateralAmount.toLocaleString()} USDi</CollWithdrawValue>
          </Stack>
        </Box>

        <ActionButton onClick={onClose} disabled={!canCloseComet}>Repay & Close Position</ActionButton>

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
      </Wrapper>
    </>
  )
}

const Wrapper = styled(Box)`
  padding: 30px; 
  background: rgba(21, 22, 24, 0.75); 
  border-radius: 10px; 
  margin-top: 17px;
`
const Title = styled('div')`
	font-size: 16px;
	font-weight: 600;
	color: #fff;
  margin-left: 15px;
	margin-bottom: 15px;
`
const PositionWrapper = styled(Box)`
  border-radius: 10px; 
  background-color: rgba(255, 255, 255, 0.08); 
  padding: 11px 24px 9px 27px;
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
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: #444;
    color: #adadad;
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
const CollWithdrawValue = styled('div')`
  color: #fff; 
  font-size: 14px; 
  font-weight: 500;
`

export default withSuspense(ClosePanel, <LoadingProgress />)
