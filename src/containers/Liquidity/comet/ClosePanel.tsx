import React, { useEffect, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCloseMutation } from '~/features/Comet/Comet.mutation'
import { CometDetail } from '~/features/MyLiquidity/CometPosition.query'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import CheckCircleOutlineRoundedIcon from 'public/images/check-mark-icon.svg'
import InfoTooltip from '~/components/Common/InfoTooltip'
import { TooltipTexts } from '~/data/tooltipTexts'
import { SubmitButton } from '~/components/Common/CommonButtons'

const ClosePanel = ({ assetId, cometDetail, balance, onRefetchData }: { assetId: string, cometDetail: CometDetail, balance: number, onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
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
    try {
      setLoading(true)
      const data = await mutateAsync(
        {
          cometIndex,
          cType
        })

      if (data) {
        console.log('data', data)
        setLoading(false)

        if (cType === 0) {
          onRefetchData()
          setNoBorrowedAsset(true)
        } else {
          router.replace("/liquidity").then(() => {
            router.reload()
          })
        }
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }

  }

  return (
    <>
      <Box padding='15px'>
        {!noBorrowedAsset &&
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Box><Typography variant='p_lg' color={'#989898'}>ILD Debt</Typography></Box>
              <Box><Typography variant='p_lg' color={'#989898'}>{Math.abs(cometDetail.ild).toLocaleString()} {cometDetail.ildInUsdi ? 'USDi' : cometDetail.tickerSymbol}</Typography></Box>
            </Stack>
            <Stack direction="row" justifyContent="space-between" mt='5px'>
              <Box><Typography variant='p_lg' color={'#989898'}>USDi Wallet Balance</Typography></Box>
              <Box><Typography variant='p_lg' color={notEnoughBalance ? '#ed2525' : '#989898'}>{balance.toLocaleString()} {cometDetail.ildInUsdi ? 'USDi' : cometDetail.tickerSymbol}</Typography></Box>
            </Stack>

            {notEnoughBalance && <Box textAlign='right'><Typography variant='p' color='#ed2525'>Your Wallet Balance must be greater than ILD Debt</Typography></Box>}
          </Box>
        }

        <SubmitButton sx={{ display: 'flex', justifyContent: 'space-between' }} onClick={() => onClose(0)} disabled={noBorrowedAsset || notEnoughBalance || loading}>
          <Image src={OneIcon} width={17} />
          <Box><Typography variant='p_lg'>Withdraw Liquidity & pay ILD</Typography></Box>
          <Box>{noBorrowedAsset && <Box display='flex' alignItems='center'><Image src={CheckCircleOutlineRoundedIcon} /> <Typography variant='p_lg' color='#4fe5ff' ml='5px'>Complete</Typography> </Box>}</Box>
        </SubmitButton>

        <Stack direction="row" justifyContent="space-between" mt="25px">
          <Box><Typography variant='p_lg' color={noBorrowedAsset ? '#fff' : '#989898'}>Withdraw-able Collateral <InfoTooltip title={TooltipTexts.collateralWithdrawCloseComet} /></Typography></Box>
          <Box><Typography variant='p_lg' color={noBorrowedAsset ? '#fff' : '#989898'}>{cometDetail.collAmount} USDi</Typography></Box>
        </Stack>

        <SubmitButton sx={{ display: 'flex', justifyContent: 'space-between' }} onClick={() => onClose(1)} disabled={!noBorrowedAsset || loading}><Image src={TwoIcon} width={17} /> <Typography variant='p_lg'>Close Comet & Withdraw Collateral</Typography> <div></div></SubmitButton>
      </Box >
    </>
  )
}

export default ClosePanel
