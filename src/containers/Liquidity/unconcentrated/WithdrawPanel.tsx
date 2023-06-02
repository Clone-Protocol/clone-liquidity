import React, { useState, useCallback, useEffect } from 'react'
import { Box, Stack, styled, Typography } from '@mui/material'
import RatioSlider from '~/components/Liquidity/unconcent/RatioSlider'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUnconcentDetailQuery } from '~/features/MyLiquidity/UnconcentPosition.query'
import { useBalanceQuery } from '~/features/UnconcentratedLiquidity/Balance.query'
import { useWithdrawMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import { SubmitButton } from '~/components/Common/CommonButtons'

const WithdrawPanel = ({ assetId, handleClose }: { assetId: string, handleClose: () => void }) => {
  const { publicKey } = useWallet()
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
    try {
      setLoading(true)
      const data = await mutateAsync(
        {
          index: unconcentratedIndex,
          amount,
          percent
        }
      )

      if (data) {
        setLoading(false)
        console.log('data', data)
        refetch()
        handleClose()
        //hacky sync
        location.reload()
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return unconcentData ? (
    <>
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
                <Image src={'/images/assets/on-usd.png'} width="28px" height="28px" />
                <Typography variant='p_lg' ml='4px'>onUSD</Typography>
              </Box>
              <Box lineHeight={1} textAlign='right'>
                <Box><Typography variant='p_xlg'>{amount.toLocaleString()}</Typography></Box>
                <Box><Typography variant='p' color='#989898'>${amount.toLocaleString()} USD</Typography></Box>
              </Box>
            </Stack>
          </FormBox>
          <BottomBox><Typography variant='p' color='#949494'>Withdrawable: </Typography> <Typography variant='p'>{data?.maxVal.toLocaleString()} onUSD</Typography></BottomBox>
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
                <Box><Typography variant='p' color='#989898'>${(amount).toLocaleString(undefined, { maximumFractionDigits: 5 })} USD</Typography></Box>
              </Box>
            </Stack>
          </FormBox>
          <BottomBox><Typography variant='p' color='#949494'>Withdrawable: </Typography> <Typography variant='p'>{(data?.maxVal! / unconcentData.price).toLocaleString(undefined, { maximumFractionDigits: 5 })} {unconcentData.tickerSymbol}</Typography></BottomBox>
        </StyledBox>
      </Stack>

      <SubmitButton onClick={onWithdraw} disabled={loading}>Withdraw</SubmitButton>
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

export default WithdrawPanel
