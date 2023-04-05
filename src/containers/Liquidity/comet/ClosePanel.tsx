import React, { useEffect, useState } from 'react'
import { Box, Stack, Button, Typography } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCloseMutation } from '~/features/Comet/Comet.mutation'
import { CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import CheckCircleOutlineRoundedIcon from 'public/images/check-mark-icon.svg'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import DataLoadingIndicator from '~/components/Common/DataLoadingIndicator'
import { SubmitButton } from '~/components/Common/CommonButtons'

const ClosePanel = ({ assetId, cometDetail, balance, onRefetchData }: { assetId: string, cometDetail: CometDetail, balance: number, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [noBorrowedAsset, setNoBorrowedAsset] = useState(false)
  const [notEnoughBalance, setNotEnoughBalance] = useState(false)

  const { mutateAsync } = useCloseMutation(publicKey)

  const cometIndex = parseInt(assetId)

  useEffect(() => {
    if (cometDetail) {
      setNoBorrowedAsset(cometDetail.mintIassetAmount === 0 && cometDetail.mintAmount === 0)
      setNotEnoughBalance(cometDetail.ild > balance)
    }
  }, [cometDetail])

  const onClose = async (cType: number) => {
    setLoading(true)
    await mutateAsync(
      {
        cometIndex,
        cType
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            setLoading(false)

            if (cType === 0) {
              // enqueueSnackbar("Comet partially closed, please proceed to next step")
              onRefetchData()
              setNoBorrowedAsset(true)
            } else {
              // enqueueSnackbar("Comet successfully closed")
              router.replace("/liquidity").then(() => {
                router.reload()
              })
            }
          }
        },
        onError(err) {
          console.error(err)
          // enqueueSnackbar('Error closing comet position')
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

      <Box padding='15px'>
        {/* <Stack direction="row" justifyContent="space-between" mt='5px'>
          <Box><Typography variant='p_lg' color='#989898'>Current Collateral</Typography></Box>
          <Box><Typography variant='p_lg' color='#989898'>{cometDetail.collAmount.toLocaleString()}  USDi</Typography></Box>
        </Stack> */}
        {!noBorrowedAsset &&
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Box><Typography variant='p_lg' color={'#989898'}>ILD Dept</Typography></Box>
              <Box><Typography variant='p_lg' color={'#989898'}>{Math.abs(cometDetail.ild).toLocaleString()} USDi</Typography></Box>
            </Stack>
            <Stack direction="row" justifyContent="space-between" mt='5px'>
              <Box><Typography variant='p_lg' color={'#989898'}>USDi Wallet Balance</Typography></Box>
              <Box><Typography variant='p_lg' color={notEnoughBalance ? '#ed2525' : '#989898'}>{balance.toLocaleString()} USDi</Typography></Box>
            </Stack>

            {notEnoughBalance && <Box textAlign='right'><Typography variant='p' color='#ed2525'>Your Wallet Balance must be greater than ILD Debt</Typography></Box>}
          </Box>
        }

        <SubmitButton sx={{ display: 'flex', justifyContent: 'space-between' }} onClick={() => onClose(0)} disabled={noBorrowedAsset || notEnoughBalance}>
          <Image src={OneIcon} width={17} />
          <Box><Typography variant='p_lg'>Withdraw Liquidity & pay ILD</Typography></Box>
          <Box>{noBorrowedAsset && <Box display='flex' alignItems='center'><Image src={CheckCircleOutlineRoundedIcon} /> <Typography variant='p_lg' color='#4fe5ff' ml='5px'>Complete</Typography> </Box>}</Box>
        </SubmitButton>

        <Stack direction="row" justifyContent="space-between" mt="25px">
          <Box><Typography variant='p_lg' color={noBorrowedAsset ? '#fff' : '#989898'}>Withdraw-able Collateral <InfoTooltip title={TooltipTexts.collateralWithdrawCloseComet} /></Typography></Box>
          <Box><Typography variant='p_lg' color={noBorrowedAsset ? '#fff' : '#989898'}>{(cometDetail.collAmount - Math.abs(cometDetail.ild)).toLocaleString()} USDi</Typography></Box>
        </Stack>

        <SubmitButton sx={{ display: 'flex', justifyContent: 'space-between' }} onClick={() => onClose(1)} disabled={!noBorrowedAsset}><Image src={TwoIcon} width={17} /> <Typography variant='p_lg'>Close Comet & Withdraw Collateral</Typography> <div></div></SubmitButton>

        <Box display='flex' justifyContent='center'>
          <DataLoadingIndicator />
        </Box>
      </Box >
    </>
  )
}

export default ClosePanel
