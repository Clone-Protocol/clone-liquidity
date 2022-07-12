import React, { useState, useCallback, useEffect } from 'react'
import { Box, Stack, Divider, styled, Button, Dialog, DialogContent } from '@mui/material'
import RatioSlider from '~/components/Liquidity/unconcent/RatioSlider'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUnconcentDetailQuery } from '~/features/MyLiquidity/UnconcentPosition.query'
import { useBalanceQuery } from '~/features/UnconcentratedLiquidity/Balance.query'
import { useWithdrawMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import LoadingIndicator, { LoadingWrapper } from '~/components/Common/LoadingIndicator'
import { PoolList } from '~/features/MyLiquidity/UnconcentratedPools.query'

const WithdrawDialog = ({ assetId, pool, open, handleClose }: { assetId: string, pool: PoolList, open: any, handleClose: any }) => {
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
	  refetchOnMount: true,
    enabled: open && publicKey != null
	})

  const { data: unconcentData } = useUnconcentDetailQuery({
    userPubKey: publicKey,
    index: unconcentratedIndex,
	  refetchOnMount: true,
    enabled: open && publicKey != null
	})

  //default amount
  useEffect(() => {
    if (data?.maxVal) {
      setAmount((data?.maxVal * percent) / 100)
    }
  }, [data?.maxVal])

	const handleChangePercent = useCallback((event: Event, newValue: number | number[]) => {
		if (typeof newValue === 'number' && data?.maxVal) {
      // console.log('m', (data?.maxVal * percent) / 100)
			setPercent(newValue)
			setAmount((data?.maxVal * percent) / 100)
		}
	}, [data?.maxVal, amount, percent])

	const onWithdraw = async () => {
    setLoading(true)
    await mutateAsync(
      {
        index: unconcentratedIndex,
        amount
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to withdraw')

            handleClose()
            refetch()
          }
          setLoading(false)
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to withdraw')
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

      <Dialog open={open} onClose={handleClose}>
        <DialogContent sx={{ width: '570px', backgroundColor: '#16171a', padding: '20px 6px' }}>
          <Box sx={{ padding: '8px 32px', color: '#fff' }}>		
            <SubTitle>Select withdraw amount</SubTitle>
            <RatioSlider
              min={0}
              max={100}
              value={percent}
              onChange={handleChangePercent}
            />
            <StyledDivider />

            <Stack direction="row" gap={2}>
              <StyledBox>
                <FormBox>
                  <Stack sx={{ marginTop: '5px'}} direction="row" justifyContent="space-between" alignItems="center">
                    <Box display="flex">
                      <Image src={'/images/assets/USDi.png'} width="28px" height="28px" />
                      <Box sx={{ width: '80px', marginLeft: '8px', textAlign: 'left' }}>
                        USDi
                      </Box>
                    </Box>
                    <Box sx={{ color: '#949494'}}>
                      <Box sx={{ fontSize: '16px', fontWeight: '500', lineHeight: '14px' }}>{amount.toLocaleString()}</Box>
                      <Box sx={{ fontSize: '10px', textAlign: 'right' }}>${amount.toLocaleString()}</Box>
                    </Box>
                  </Stack>
                </FormBox>
                <BottomBox>Withdrawable: {data?.maxVal.toLocaleString()} USDi</BottomBox>
              </StyledBox>
              <StyledBox>
                <FormBox>
                  <Stack sx={{ marginTop: '5px'}} direction="row" justifyContent="space-between" alignItems="center">
                    <Box display="flex">
                      <Image src={unconcentData.tickerIcon} width="28px" height="28px" />
                      <Box sx={{ width: '80px', marginLeft: '8px', textAlign: 'left' }}>
                        {unconcentData.tickerSymbol}
                      </Box>
                    </Box>
                    <Box sx={{ color: '#949494'}}>
                      <Box sx={{ fontSize: '16px', fontWeight: '500', lineHeight: '14px' }}>{(amount/unconcentData.price).toLocaleString()}</Box>
                      <Box sx={{ fontSize: '10px', textAlign: 'right' }}>${(amount * unconcentData.price).toLocaleString()}</Box>
                    </Box>
                  </Stack>
                </FormBox>
                <BottomBox>Withdrawable: {(data?.maxVal/unconcentData.price).toLocaleString()} {unconcentData.tickerSymbol}</BottomBox>
              </StyledBox>
            </Stack>
              
            <StyledDivider />

            <ActionButton onClick={onWithdraw}>Withdraw</ActionButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
	) : <></>
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 20px;
	margin-top: 20px;
	height: 1px;
`

const SubTitle = styled('div')`
	font-size: 18px;
	font-weight: 500;
	margin-bottom: 17px;
	color: #fff;
`

const StyledBox = styled(Box)`
  border-radius: 10px;
  border: solid 1px #444;
  width: 244px;
  margin-top: 8px;
`

const FormBox = styled(Box)`
  height: 54px; 
  padding: 14px 12px;
  font-size: 14px;
  font-weight: 600;
  font-stretch: normal;
  background: #252627;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`

const BottomBox = styled(Box)`
  height: 23px;
  background: #252627;
  font-size: 11px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #949494;
  padding-top: 3px;
  border-top: 1px solid #444;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`

const ActionButton = styled(Button)`
  width: 100%;
  background: #4e609f;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  &:hover {
    background-color: #7A86B6;
  }
  &:disabled {
    background-color: #444;
    color: #adadad;
  }
`

export default WithdrawDialog
