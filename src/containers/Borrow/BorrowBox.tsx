import { Box, Stack, Button, Paper, Divider } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import PairInput from '~/components/Borrow/PairInput'
import ethLogo from '../../../public/images/assets/ethereum-eth-logo.svg'
import RatioSlider from '~/components/Borrow/RatioSlider'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { MintAsset as MintAssetType, fetchAsset } from '~/web3/MyLiquidity/Borrow'

const BorrowBox = () => {
  const [fromAmount, setFromAmount] = useState(0.0)
  const [toAmount, setToAmount] = useState(0.0)
  const [collRatio, setCollRatio] = useState(150)
  const { publicKey } = useWallet()
  const { getInceptApp } = useIncept()
  const [assetData, setAssetData] = useState<MintAssetType>()
  const [assetIndex, setAssetIndex] = useState(0)

  useEffect(() => {
    const program = getInceptApp('EwZEhz1NLbzSKLQ6jhu2kk6784Ly2EWJo4BK3HTmFvEv') 

    async function fetch() {
      const assetData = await fetchAsset({
        program,
        userPubKey: publicKey,
        index: assetIndex
      })
      setAssetData(assetData)
    }
    fetch()
  }, [publicKey])

  const onBorrow = () => {

  }

  const handleAssetChange = (index: number) => {
    setAssetIndex(index)
  }

  const handleChangeCollRatio = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setCollRatio(newValue)
    }
  }

  return (
    <StyledPaper variant="outlined">
      <Box sx={{ fontSize: '24px', fontWeight: '600', marginBottom: '30px' }}>Borrow</Box>
      <Box>
        <SubTitle>(1) Choose a collateral asset</SubTitle>
        <SubTitleComment>The collateral asset may affert the minimum collateral ratio.</SubTitleComment>
        <PairInput tickerIcon={ethLogo} tickerName="USD Coin" tickerSymbol="USDC" value={fromAmount} />
      </Box>
      <StyledDivider />

      <Box>
        <SubTitle>(2) Set collateral ratio</SubTitle>
        <SubTitleComment>Liquidation will be triggerd when the position’s collateral ratio is below minimum.</SubTitleComment>
        <Box sx={{ marginTop: '20px' }}>
          <RatioSlider value={collRatio} onChange={handleChangeCollRatio} />
        </Box>
      </Box>
      <StyledDivider />

      <Box>
        <SubTitle>(3) Borrow Amount</SubTitle>
        <SubTitleComment>The position can be closed when the full borrowed amount is repayed</SubTitleComment>
        <PairInput tickerIcon={ethLogo} tickerName="Incept USD" tickerSymbol="USDi" value={toAmount} />
        <Stack sx={{ border: '1px solid #9d9d9d', borderRadius: '10px', color: '#9d9d9d', padding: '12px', marginTop: '19px' }} direction="row" justifyContent="space-between">
          <Box>Price of asset bring borrowed</Box>
          <Box>1 iSOL - 100.00 USDi</Box>
        </Stack>
      </Box>
      <StyledDivider />

      <ActionButton onClick={onBorrow}>Create Borrow Position</ActionButton>
    </StyledPaper>
  )
}

const StyledPaper = styled(Paper)`
  width: 620px;
  font-size: 14px;
  font-weight: 500; 
  text-align: center;
  color: #fff;
  border-radius: 8px;
  text-align: left;
  background: #171717;
  padding-left: 53px;
  padding-top: 26px;
  padding-bottom: 42px;
  padding-right: 54px;
`
const StyledDivider = styled(Divider)`
  background-color: #535353;
  margin-bottom: 39px;
  margin-top: 39px;
  height: 1px;
`

const SubTitle = styled('div')`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 17px;
`

const SubTitleComment = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #989898;
`

const ActionButton = styled(Button)`
  width: 100%;
  background: #7d7d7d;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
`

export default BorrowBox