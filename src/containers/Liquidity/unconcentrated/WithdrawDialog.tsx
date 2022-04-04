import React, { useState, useEffect } from 'react'
import { Box, Stack, Divider, styled, Button, Dialog, DialogContent } from '@mui/material'
import RatioSlider from '~/components/Borrow/RatioSlider'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { fetchMax } from '~/web3/UnconcentratedLiquidity/balance'
import { callWithdraw } from '~/web3/UnconcentratedLiquidity/liquidity'

const WithdrawDialog = ({ assetId, open, handleClose }: any) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
	const [amount, setAmount] = useState(0.0)
	const [percent, setPercent] = useState(50)
	const [maxValue, setMaxValue] = useState(0.0)
	const [unconcentratedIndex, _] = useState(parseInt(assetId) - 1)

	useEffect(() => {
		const program = getInceptApp()

		async function fetch() {
			if (assetId) {
				const data = await fetchMax({
					program,
					userPubKey: publicKey,
					index: unconcentratedIndex,
				})
				if (data) {
					setMaxValue(data.maxVal)
				}
			}
		}
		fetch()
	}, [open, publicKey, assetId])

	const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value) {
			const amt = parseFloat(e.currentTarget.value)
			setAmount(amt)
			setPercent((amt * 100) / maxValue)
		}
	}

	const handleChangePercent = (event: Event, newValue: number | number[]) => {
		if (typeof newValue === 'number') {
			setPercent(newValue)
			setAmount((maxValue * percent) / 100)
		}
	}

	const onWithdraw = async () => {
		const program = getInceptApp()
		await callWithdraw(program, publicKey!, unconcentratedIndex, amount)

		handleClose()
	}

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogContent sx={{ width: '570px', backgroundColor: '#171717', border: 'solid 1px #535353' }}>
				<Box sx={{ padding: '30px', color: '#fff' }}>
					<Box>
						<SubTitle>Select withdrawal amount</SubTitle>
						<Stack direction="row" justifyContent="flex-end">
							<Box sx={{ fontSize: '13px', fontWeight: '500' }}>Max Value: {maxValue}</Box>
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
