import React, { useState, useCallback } from 'react'
import { Box, Stack, Divider, styled, Button, Dialog, DialogContent } from '@mui/material'
import RatioSlider from '~/components/Liquidity/unconcent/RatioSlider'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUnconcentDetailQuery } from '~/features/MyLiquidity/UnconcentPosition.query'
import { useBalanceQuery } from '~/features/UnconcentratedLiquidity/Balance.query'
import { useWithdrawMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'

const WithdrawDialog = ({ assetId, open, handleClose }: any) => {
	const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
	const [amount, setAmount] = useState(0.0)
	const [percent, setPercent] = useState(50)
	const unconcentratedIndex = parseInt(assetId)
  const { mutateAsync } = useWithdrawMutation(publicKey)

  const { data } = useBalanceQuery({
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

	const handleChangePercent = useCallback((event: Event, newValue: number | number[]) => {
		if (typeof newValue === 'number' && data?.maxVal) {
      // console.log('n', newValue)
      // console.log('m', (data?.maxVal * percent) / 100)
			setPercent(newValue)
			setAmount((data?.maxVal * percent) / 100)
		}
	}, [amount, percent])

	const onWithdraw = async () => {
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
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to withdraw')
        }
      }
    )
	}

	return unconcentData ? (
		<Dialog open={open} onClose={handleClose}>
			<DialogContent sx={{ width: '570px', backgroundColor: '#16171a' }}>
				<Box sx={{ padding: '20px', color: '#fff' }}>		
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
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box display="flex">
                    <Image src={'/images/assets/USDi.png'} width="28px" height="28px" />
                    <Box sx={{ width: '80px', marginLeft: '8px', textAlign: 'left' }}>
                      USDi
                    </Box>
                  </Box>
                  <Box sx={{ color: '#949494'}}>{amount.toLocaleString()}</Box>
                </Stack>
              </FormBox>
              <BottomBox>Withdrawable: {data?.maxVal.toLocaleString()} USDi</BottomBox>
            </StyledBox>
            <StyledBox>
              <FormBox>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box display="flex">
                    <Image src={unconcentData.tickerIcon} width="28px" height="28px" />
                    <Box sx={{ width: '80px', marginLeft: '8px', textAlign: 'left' }}>
                      {unconcentData.tickerSymbol}
                    </Box>
                  </Box>
                  <Box sx={{ color: '#949494'}}>{(amount/unconcentData.price).toLocaleString()}</Box>
                </Stack>
              </FormBox>
              <BottomBox>Withdrawable: {data?.maxVal.toLocaleString()} {unconcentData.tickerSymbol}</BottomBox>
            </StyledBox>
          </Stack>
						
					<StyledDivider />

					<ActionButton onClick={onWithdraw}>Withdraw</ActionButton>
				</Box>
			</DialogContent>
		</Dialog>
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

const TxtAmount = styled(`div`)`
	width: 60px;
	margin-left: 10px;
	text-align: right;
	border: 0px;
	background-color: #323436;
	font-size: 14px;
	font-weight: 600;
	color: #fff;
`

const ActionButton = styled(Button)`
  width: 100%;
  background: #4e609f;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
`

export default WithdrawDialog
