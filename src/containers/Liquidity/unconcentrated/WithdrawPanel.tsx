import React, { useState, useCallback, useEffect } from 'react'
import { Box, Stack, styled, Button, Typography } from '@mui/material'
import RatioSlider from '~/components/Liquidity/unconcent/RatioSlider'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUnconcentDetailQuery } from '~/features/MyLiquidity/UnconcentPosition.query'
import { useBalanceQuery } from '~/features/UnconcentratedLiquidity/Balance.query'
import { useWithdrawMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'

const WithdrawPanel = ({ assetId, handleClose }: { assetId: string, handleClose: () => void }) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(0.0)
  const [percent, setPercent] = useState(50)
  const unconcentratedIndex = parseInt(assetId)
  const { mutateAsync } = useWithdrawMutation(publicKey)

  const { data, refetch } = useBalanceQuery({
    userPubKey: publicKey,
    index: unconcentratedIndex,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  const { data: unconcentData } = useUnconcentDetailQuery({
    userPubKey: publicKey,
    index: unconcentratedIndex,
    refetchOnMount: "always",
    enabled: publicKey != null
  })

  //default amount
  useEffect(() => {
    if (data?.maxVal) {
      setAmount((data?.maxVal * percent) / 100)
    }
  }, [data?.maxVal])

  const handleChangePercent = useCallback((event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number' && data?.maxVal) {
      setPercent(newValue)
      setAmount((data?.maxVal * newValue) / 100)
    }
  }, [data?.maxVal, amount, percent])

  const onWithdraw = async () => {
    setLoading(true)
    handleClose()
    await mutateAsync(
      {
        index: unconcentratedIndex,
        amount,
        percent
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Withdrawal was successful')

            refetch()
            //hacky sync
            location.reload()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('A withdrawal error occurred')
          setLoading(false)
        }
      }
    )
  }

  return unconcentData ? (
    <>
      {loading && (
        <LoadingWrapper>
          <LoadingIndicator open inline />
        </LoadingWrapper>
      )}


      <RatioSlider
        min={0}
        max={100}
        value={percent}
        onChange={handleChangePercent}
      />

      <Stack direction="row" gap={1} mt='18px' mb='8px'>
        <StyledBox>
          <FormBox>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <Image src={'/images/assets/USDi.png'} width="28px" height="28px" />
                <Typography variant='p_lg' ml='4px'>USDi</Typography>
              </Box>
              <Box lineHeight={1} textAlign='right'>
                <Box><Typography variant='p_xlg'>{amount.toLocaleString()}</Typography></Box>
                <Box><Typography variant='p' color='#989898'>${amount.toLocaleString()} USD</Typography></Box>
              </Box>
            </Stack>
          </FormBox>
          <BottomBox><Typography variant='p' color='#949494'>Withdrawable: </Typography> <Typography variant='p'>{data?.maxVal.toLocaleString()} USDi</Typography></BottomBox>
        </StyledBox>
        <StyledBox>
          <FormBox>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <Image src={unconcentData.tickerIcon} width="28px" height="28px" />
                <Typography variant='p_lg' ml='4px'>{unconcentData.tickerSymbol}</Typography>
              </Box>
              <Box lineHeight={1} textAlign='right'>
                <Box><Typography variant='p_xlg'>{(amount / unconcentData.price).toLocaleString(undefined, { maximumFractionDigits: 5 })}</Typography></Box>
                <Box><Typography variant='p' color='#989898'>${(amount * unconcentData.price).toLocaleString(undefined, { maximumFractionDigits: 5 })} USD</Typography></Box>
              </Box>
            </Stack>
          </FormBox>
          <BottomBox><Typography variant='p' color='#949494'>Withdrawable: </Typography> <Typography variant='p'>{(data?.maxVal! / unconcentData.price).toLocaleString(undefined, { maximumFractionDigits: 5 })} {unconcentData.tickerSymbol}</Typography></BottomBox>
        </StyledBox>
      </Stack>

      <ActionButton onClick={onWithdraw}>Withdraw</ActionButton>
    </>
  ) : <></>
}

const StyledBox = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  width: 244px;
  margin-top: 8px;
`
const FormBox = styled(Box)`
  height: 54px; 
  padding: 14px 12px;
  font-size: 14px;
  font-weight: 600;
  font-stretch: normal;
`
const BottomBox = styled(Box)`
  height: 30px;
  text-align: center;
  border-top: solid 1px ${(props) => props.theme.boxes.greyShade};
`
const ActionButton = styled(Button)`
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

export default WithdrawPanel
