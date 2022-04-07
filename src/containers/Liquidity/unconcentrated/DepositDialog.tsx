import React, { useState } from 'react'
import { Box, Divider, styled, Button, Dialog, DialogContent } from '@mui/material'
import PairInput from '~/components/Borrow/PairInput'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUnconcentDetailQuery } from '~/features/MyLiquidity/UnconcentPosition.query'
import { useBalanceQuery } from '~/features/Borrow/Balance.query'
import { callDeposit } from '~/web3/UnconcentratedLiquidity/liquidity'
import Image from 'next/image'
import OneIcon from 'public/images/one-icon.png'
import TwoIcon from 'public/images/two-icon.png'

const DepositDialog = ({ assetId, open, handleClose }: any) => {
	const { publicKey } = useWallet()
	const { getInceptApp } = useIncept()
	// const [unconcentData, setUnconcentData] = useState<UnconcentPI>(fetchUnconcentrated()) // set default
	const unconcentratedIndex = parseInt(assetId)
  const [borrowFrom, setBorrowFrom] = useState(0.0)
  const [borrowTo, setBorrowTo] = useState(0.0)

  const { data: balances } = useBalanceQuery({
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

	const handleBorrowFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value && unconcentData) {
			const amount = parseFloat(e.currentTarget.value)
      setBorrowFrom(amount)
      setBorrowTo(amount * unconcentData.price)
		} else {
      setBorrowFrom(0.0)
		}
	}

	const handleBorrowTo = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value && unconcentData) {
			const amount = parseFloat(e.currentTarget.value)
      setBorrowFrom(amount / unconcentData.price)
      setBorrowTo(amount)
		} else {
      setBorrowTo(0.0)
		}
	}

	const onDeposit = async () => {
		const program = getInceptApp()
		await callDeposit(program, publicKey!, unconcentratedIndex, borrowFrom)

		handleClose()
	}

	return unconcentData ? (
		<Dialog open={open} onClose={handleClose}>
			<DialogContent sx={{ backgroundColor: '#171717', border: 'solid 1px #535353' }}>
				<Box sx={{ padding: '30px', color: '#fff' }}>
					<Box>
						<SubTitle><Image src={OneIcon} /> <Box sx={{ marginLeft: '9px' }}>Provide additional {unconcentData.tickerSymbol} to deposit</Box></SubTitle>
						<SubTitleComment>Acquire {unconcentData.tickerSymbol} by Borrowing</SubTitleComment>
						<PairInput
							tickerIcon={unconcentData.tickerIcon}
							tickerName={unconcentData.tickerName}
							tickerSymbol={unconcentData.tickerSymbol}
							value={borrowFrom}
							balance={balances?.usdiVal}
							onChange={handleBorrowFrom}
						/>
					</Box>
					<StyledDivider />

					<Box>
						<SubTitle><Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Provide additional USDi to deposit</Box></SubTitle>
						<SubTitleComment>Equivalent value of USDi must be provided</SubTitleComment>
						<PairInput
							tickerIcon={'/images/assets/USDi.png'}
							tickerName="USDi Coin"
							tickerSymbol="USDi"
							value={borrowTo}
							balance={balances?.iassetVal}
							onChange={handleBorrowTo}
						/>
					</Box>
					<StyledDivider />
					<ActionButton onClick={onDeposit}>Deposit</ActionButton>
				</Box>
			</DialogContent>
		</Dialog>
	) : <></>
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 39px;
	margin-top: 39px;
	height: 1px;
`

const SubTitle = styled('div')`
  display: flex;
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
  font-size: 18px;
  font-weight: 500;
	margin-bottom: 15px;
`

export default DepositDialog
