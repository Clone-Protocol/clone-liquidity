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

const ClosePanel = ({ assetId, cometDetail, onRefetchData }: { assetId: string, cometDetail: CometDetail, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [noBorrowedAsset, setNoBorrowedAsset] = useState(false)

  const { mutateAsync } = useCloseMutation(publicKey)

  const cometIndex = parseInt(assetId)

  useEffect(() => {
    if (cometDetail) {
      setNoBorrowedAsset(cometDetail.mintIassetAmount === 0 && cometDetail.mintAmount === 0)
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
              enqueueSnackbar("Comet partially closed, please proceed to next step")
              onRefetchData()
              setNoBorrowedAsset(true)
            } else {
              enqueueSnackbar("Comet successfully closed")
              router.replace("/liquidity").then(() => {
                router.reload()
              })
            }
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Error closing comet position')
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
        <Box>
          <Stack direction="row" justifyContent="space-between" mt='5px'>
            <Box><Typography variant='p_lg' color='#989898'>Current Collateral</Typography></Box>
            <Box><Typography variant='p_lg' color='#989898'>80,530.61 USDi</Typography></Box>
          </Stack>
          <Stack direction="row" justifyContent="space-between" mt='15px'>
            <Box><Typography variant='p_lg' color='#989898'>ILD Dept</Typography></Box>
            <Box><Typography variant='p_lg' color='#989898'>{Math.abs(cometDetail.ild).toLocaleString()} USDi</Typography></Box>
          </Stack>
          <Stack direction="row" justifyContent="space-between" mt="15px">
            <Box><Typography variant='p_lg'>Withdraw-able Collateral <InfoTooltip title={TooltipTexts.collateralWithdrawCloseComet} /></Typography></Box>
            <Box><Typography variant='p_lg'>{cometDetail.collAmount.toLocaleString()} USDi</Typography></Box>
          </Stack>
        </Box>

        <ActionButton onClick={() => onClose(0)} disabled={noBorrowedAsset}>
          <Image src={OneIcon} width={17} />
          <Box><Typography variant='p_lg'>Withdraw Liquidity & pay ILD</Typography></Box>
          <Box>{noBorrowedAsset && <Box display='flex' alignItems='center'><Image src={CheckCircleOutlineRoundedIcon} /> <Typography variant='p_lg' color='#4fe5ff' ml='5px'>Complete</Typography> </Box>}</Box>
        </ActionButton>
        <ActionButton onClick={() => onClose(1)} disabled={!noBorrowedAsset}><Image src={TwoIcon} width={17} /> <Typography variant='p_lg'>Close Comet & Withdraw Collateral</Typography> <div></div></ActionButton>

        <Box display='flex' justifyContent='center'>
          <DataLoadingIndicator />
        </Box>
      </Box>
    </>
  )
}

const ActionButton = styled(Button)`
  display: flex;
  justify-content: space-between;
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

export default ClosePanel
