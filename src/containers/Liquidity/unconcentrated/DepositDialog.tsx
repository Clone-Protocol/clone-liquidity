import React, { useState, useEffect } from 'react'
import { Box, Divider, styled, Button, Dialog, DialogContent } from '@mui/material'
import PairInput from '~/components/Borrow/PairInput'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { fetchUnconcentDetail, UnconcentratedData as UnconcentPI } from '~/web3/MyLiquidity/UnconcentPosition'
import { fetchUnconcentrated } from '~/features/Overview/Asset.query'
import { fetchBalance } from '~/web3/Borrow/balance'
import { callDeposit } from '~/web3/UnconcentratedLiquidity/liquidity'

const DepositDialog = ({ assetId, open, handleClose }: any) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
	const [unconcentData, setUnconcentData] = useState<UnconcentPI>(fetchUnconcentrated()) // set default
	const [unconcentratedIndex, _] = useState(parseInt(assetId) - 1)

	useEffect(() => {
		const program = getInceptApp()

		async function fetch() {
			if (open && assetId) {
				const data = (await fetchUnconcentDetail({
					program,
					userPubKey: publicKey,
					index: unconcentratedIndex,
				})) as UnconcentPI
				if (data) {
					const balances = await fetchBalance({
						program,
						userPubKey: publicKey,
						// @ts-ignore
						index: unconcentratedIndex,
					})
					if (balances) {
						data.borrowFromBalance = balances.usdiVal
						data.borrowToBalance = balances.iassetVal
						setUnconcentData(data)
					}
				}
			}
		}
		fetch()
	}, [open, publicKey, assetId])

	const handleBorrowFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newData
		if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)
			newData = {
				...unconcentData,
				borrowFrom: amount,
				borrowTo: amount * unconcentData.price,
			}
		} else {
			newData = {
				...unconcentData,
				borrowFrom: 0.0,
			}
		}
		setUnconcentData(newData)
	}

	const handleBorrowTo = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newData
		if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)
			newData = {
				...unconcentData,
				borrowTo: amount,
				borrowFrom: amount / unconcentData.price,
			}
		} else {
			newData = {
				...unconcentData,
				borrowTo: 0.0,
			}
		}
		setUnconcentData(newData)
	}

	const onDeposit = async () => {
		const program = getInceptApp()
		await callDeposit(program, publicKey!, unconcentratedIndex, unconcentData.borrowFrom)

		handleClose()
	}

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogContent sx={{ backgroundColor: '#171717', border: 'solid 1px #535353' }}>
				<Box sx={{ padding: '30px', color: '#fff' }}>
					<Box>
						<SubTitle>(1) Provide additional {unconcentData.tickerSymbol} to deposit</SubTitle>
						<SubTitleComment>Acquire {unconcentData.tickerSymbol} by Borrowing</SubTitleComment>
						<PairInput
							tickerIcon={unconcentData.tickerIcon}
							tickerName={unconcentData.tickerName}
							tickerSymbol={unconcentData.tickerSymbol}
							value={unconcentData.borrowFrom}
							balance={unconcentData.borrowFromBalance}
							onChange={handleBorrowFrom}
						/>
					</Box>
					<StyledDivider />

					<Box>
						<SubTitle>(2) Provide additional USDi to deposit</SubTitle>
						<SubTitleComment>Equivalent value of USDi must be provided</SubTitleComment>
						<PairInput
							tickerIcon={'/images/assets/USDi.png'}
							tickerName="USDi Coin"
							tickerSymbol="USDi"
							value={unconcentData.borrowTo}
							balance={unconcentData.borrowToBalance}
							onChange={handleBorrowTo}
						/>
					</Box>
					<StyledDivider />
					<ActionButton onClick={onDeposit}>Deposit</ActionButton>
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

const SubTitleComment = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #989898;
	marginbottom: 18px;
`

const ActionButton = styled(Button)`
	width: 100%;
	background: #7d7d7d;
	color: #fff;
	border-radius: 8px;
	margin-bottom: 15px;
`

export default DepositDialog
