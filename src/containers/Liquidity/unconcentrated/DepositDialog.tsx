import React, { useState, useCallback } from 'react'
import { Box, Divider, styled, Button, Dialog, DialogContent } from '@mui/material'
import PairInput from '~/components/Liquidity/unconcent/PairInput'
import { useSnackbar } from 'notistack'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUnconcentDetailQuery } from '~/features/MyLiquidity/UnconcentPosition.query'
import { useBalanceQuery } from '~/features/Borrow/Balance.query'
import { useDepositMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import Image from 'next/image'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'

const DepositDialog = ({ assetId, open, handleClose }: any) => {
	const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

	const unconcentratedIndex = parseInt(assetId)
  const [borrowFrom, setBorrowFrom] = useState(0.0)
  const [borrowTo, setBorrowTo] = useState(0.0)
  const { mutateAsync } = useDepositMutation(publicKey)

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

	const handleBorrowFrom = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value && unconcentData) {
			const amount = parseFloat(e.currentTarget.value)
      setBorrowFrom(amount)
      setBorrowTo(amount * unconcentData.price)
		} else {
      setBorrowFrom(0.0)
		}
	}, [borrowFrom, borrowTo])

	const handleBorrowTo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value && unconcentData) {
			const amount = parseFloat(e.currentTarget.value)
      setBorrowFrom(amount / unconcentData.price)
      setBorrowTo(amount)
		} else {
      setBorrowTo(0.0)
		}
	}, [borrowFrom, borrowTo])

	const onDeposit = async () => {
    await mutateAsync(
      {
        index: unconcentratedIndex,
        iassetAmount: borrowFrom
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to borrow')

            handleClose()
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to borrow')
        }
      }
    )
	}

	return unconcentData ? (
		<Dialog open={open} onClose={handleClose}>
			<DialogContent sx={{ backgroundColor: '#16171a' }}>
				<Box sx={{ padding: '20px', color: '#fff' }}>
          <WarningBox>
            Acquire addtional iAsset and USDi by <span style={{ textDecoration: 'underline' }}>borrowing</span> and <span style={{ textDecoration: 'underline' }}>swaping</span>, click <span style={{ textDecoration: 'underline' }}>here</span> to learn more.
          </WarningBox>
					<Box sx={{ marginTop: '20px'}}>
						<SubTitle><Image src={OneIcon} /> <Box sx={{ marginLeft: '9px' }}>Provide additional <span style={{ color: '#809cff' }}>{unconcentData.tickerSymbol}</span> to deposit</Box></SubTitle>
            <PairInput
              tickerIcon={unconcentData.tickerIcon}
              tickerName={unconcentData.tickerName}
              tickerSymbol={unconcentData.tickerSymbol}
              value={borrowFrom}
              balance={balances?.iassetVal}
              onChange={handleBorrowFrom}
            />
					</Box>
					<StyledDivider />

					<Box>
						<SubTitle><Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Provide additional <span style={{ color: '#809cff' }}>USDi</span> to deposit</Box></SubTitle>
            
            <PairInput
              tickerIcon={'/images/assets/USDi.png'}
              tickerName="USDi Coin"
              tickerSymbol="USDi"
              value={borrowTo}
              balance={balances?.usdiVal}
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

const WarningBox = styled(Box)`
  max-width: 507px;
  height: 42px;
  font-size: 11px;
  font-weight: 500;
  line-height: 42px;
  color: #989898;
  border-radius: 10px;
  border: solid 1px #809cff;
  background-color: rgba(128, 156, 255, 0.09);
  text-align: center;
  margin: 0 auto;
`

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 20px;
	margin-top: 20px;
	height: 1px;
`

const SubTitle = styled('div')`
  display: flex;
	font-size: 14px;
	font-weight: 500;
	margin-bottom: 7px;
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

export default DepositDialog
