import React, { useState, useCallback } from 'react'
import { Box, Stack, Divider, styled, Button, Dialog, DialogContent } from '@mui/material'
import RatioSlider from '~/components/Borrow/RatioSlider'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
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

	const handleChangeAmount = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value && data?.maxVal) {
			const amt = parseFloat(e.currentTarget.value)
			setAmount(amt)
			setPercent((amt * 100) / data?.maxVal)
		}
	}, [amount, percent])

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

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogContent sx={{ width: '570px', backgroundColor: '#171717', border: 'solid 1px #535353' }}>
				<Box sx={{ padding: '30px', color: '#fff' }}>
					<Box>
						<SubTitle>Select withdrawal amount</SubTitle>
						<Stack direction="row" justifyContent="flex-end">
							<Box sx={{ fontSize: '13px', fontWeight: '500' }}>Max Value: {data?.maxVal}</Box>
						</Stack>
						<InputAmount id="ip-amount" type="number" value={amount} onChange={handleChangeAmount} />
						<RatioSlider
							min={0}
							max={100}
							value={Number(percent.toFixed(0))}
							onChange={handleChangePercent}
						/>
					</Box>
					<StyledDivider />

					<ActionButton onClick={onWithdraw}>Withdraw</ActionButton>
				</Box>
			</DialogContent>
		</Dialog>
	)
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 39px;
	margin-top: 39px;
	height: 1px;
`

const SubTitle = styled('div')`
	font-size: 18px;
	font-weight: 500;
	marginbottom: 17px;
	color: #fff;
`

const InputAmount = styled(`input`)`
	width: 100%;
	height: 60px;
	text-align: right;
	border: 0px;
	background-color: #333333;
	font-size: 18px;
	font-weight: 500;
	color: #fff;
	margin-top: 5px;
	margin-bottom: 20px;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #7d7d7d;
	color: #fff;
	border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
	margin-bottom: 15px;
`

export default WithdrawDialog
