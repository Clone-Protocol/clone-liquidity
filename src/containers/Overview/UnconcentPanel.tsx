import { Box, Stack, Button, Divider } from '@mui/material'
import React, { useState, useCallback } from 'react'
import { styled } from '@mui/system'
import { useSnackbar } from 'notistack'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import Image from 'next/image'
import PairInput from '~/components/Asset/PairInput'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import OneIcon from 'public/images/one-icon.svg'
import TwoIcon from 'public/images/two-icon.svg'
import WarningIcon from 'public/images/warning-icon.png'
import { useWallet } from '@solana/wallet-adapter-react'
import { UnconcentratedData as UnconcentPI } from '~/features/MyLiquidity/UnconcentPosition.query'
import { useLiquidityMutation } from '~/features/UnconcentratedLiquidity/Liquidity.mutation'
import { PositionInfo } from '~/features/MyLiquidity/CometPosition.query'
import { Balance } from '~/features/Borrow/Balance.query'

const UnconcentPanel = ({ balances, assetData, assetIndex } : { balances: Balance, assetData: PositionInfo, assetIndex: number }) => {
  const { publicKey } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [unconcentData, setUnconcentData] = useState<UnconcentPI>({
    borrowFrom: 0.0,
    borrowTo: 0.0,
  })
  const { mutateAsync: mutateAsyncLiquidity } = useLiquidityMutation(publicKey)

  const handleBorrowFrom = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		let newData
		if (e.currentTarget.value && assetData) {
			const amount = parseFloat(e.currentTarget.value)
			newData = {
				...unconcentData,
				borrowFrom: amount,
				borrowTo: amount * assetData.price,
			}
		} else {
			newData = {
				...unconcentData,
				borrowFrom: 0.0,
			}
		}
		setUnconcentData(newData)
	}, [unconcentData])

	const handleBorrowTo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		let newData
		if (e.currentTarget.value && assetData) {
			const amount = parseFloat(e.currentTarget.value)
			newData = {
				...unconcentData,
				borrowTo: amount,
				borrowFrom: amount / assetData.price,
			}
		} else {
			newData = {
				...unconcentData,
				borrowTo: 0.0,
			}
		}
		setUnconcentData(newData)
	}, [unconcentData])

	const onLiquidity = async () => {
    await mutateAsyncLiquidity(
      {
        iassetIndex: assetIndex,
			  iassetAmount: unconcentData.borrowFrom,
      },
      {
        onSuccess(data) {
          if (data) {
            console.log('data', data)
            enqueueSnackbar('Success to liquidity')
          }
        },
        onError(err) {
          console.error(err)
          enqueueSnackbar('Failed to liquidity')
        }
      }
    )
	}

  return (
    <Box>
      <PriceIndicatorBox
        tickerIcon={assetData.tickerIcon}
        tickerName={assetData.tickerName}
        tickerSymbol={assetData.tickerSymbol}
        value={assetData.price}
      />

      <Box sx={{ background: 'rgba(21, 22, 24, 0.75)', paddingX: '32px', paddingY: '24px', marginTop: '28px', borderRadius: '10px' }}>
        <Stack
          sx={{
            background: 'rgba(233, 209, 0, 0.04)',
            border: '1px solid #e9d100',
            borderRadius: '10px',
            color: '#9d9d9d',
            padding: '8px',
            marginTop: '10px',
            marginBottom: '30px',
          }}
          direction="row">
          <Box sx={{ width: '53px', textAlign: 'center', marginTop: '11px' }}>
            <Image src={WarningIcon} />
          </Box>
          <WarningBox>
            Unconcentrated liquidity positions are less capital efficent than coment liquidity. <br />
            Learn more <span style={{ textDecoration: 'underline' }}>here</span>.
          </WarningBox>
        </Stack>

        <Box>
          <SubTitle>
            <Image src={OneIcon} />{' '}
            <Box sx={{ marginLeft: '9px' }}> Provide {assetData.tickerSymbol}</Box>
          </SubTitle>
          <SubTitleComment>
            Acquire {assetData.tickerSymbol} by <span style={{ color: '#fff' }}>Borrowing</span>
          </SubTitleComment>
          <PairInput
            tickerIcon={assetData.tickerIcon}
            tickerName={assetData.tickerName}
            tickerSymbol={assetData.tickerSymbol}
            value={unconcentData.borrowFrom}
            headerTitle="Balance"
            headerValue={balances?.iassetVal}
            onChange={handleBorrowFrom}
          />
        </Box>
        <StyledDivider />

        <Box>
          <SubTitle>
            <Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}> Provide USDi</Box>
          </SubTitle>
          <SubTitleComment>An equivalent USDi amount must be provided</SubTitleComment>
          <PairInput
            tickerIcon={'/images/assets/USDi.png'}
            tickerName="USDi Coin"
            tickerSymbol="USDi"
            value={unconcentData.borrowTo}
            headerTitle="Balance"
            headerValue={balances?.usdiVal}
            onChange={handleBorrowTo}
          />
        </Box>
        <StyledDivider />

        <LiquidityButton onClick={onLiquidity}>Create Unconcentrated Liquidity Position</LiquidityButton>
      </Box>
    </Box>
  )
}

const StyledDivider = styled(Divider)`
	background-color: #535353;
	margin-bottom: 30px;
	margin-top: 30px;
	height: 1px;
`

const SubTitle = styled(Box)`
	display: flex;
	font-size: 14px;
	font-weight: 500;
`

const SubTitleComment = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
	margin-top: 10px;
`

const WarningBox = styled(Box)`
	max-width: 500px;
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
`

const LiquidityButton = styled(Button)`
	width: 100%;
  background-color: #4e609f;
	color: #fff;
  font-size: 13px;
	border-radius: 10px;
	margin-bottom: 15px;
`

export default withSuspense(UnconcentPanel, <LoadingProgress />)