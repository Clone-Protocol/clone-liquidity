import React, { useEffect, useState } from 'react'
import { Grid, Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import PositionInfo from '~/components/Liquidity/comet/PositionInfo'
import PairInput from '~/components/Borrow/PairInput'
import ethLogo from 'public/images/assets/ethereum-eth-logo.svg'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import { PositionInfo as PI, fetchCometDetail } from '~/web3/MyLiquidity/CometPosition'

const EditPanel = () => {
  const { publicKey } = useWallet()
  const { getInceptApp } = useIncept()
  const [fromAmount, setFromAmount] = useState(0.0)
  const [toAmount, setToAmount] = useState(0.0)
  const [collRatio, setCollRatio] = useState(150)
  const [positionInfo, setPositionInfo] = useState<PI>()
  const [assetIndex, setAssetIndex] = useState(0)

  useEffect(() => {
    const program = getInceptApp()

    async function fetch() {
      const data = await fetchCometDetail({
        program,
        userPubKey: publicKey,
        index: assetIndex
      })
      if (data) {
        setPositionInfo(data)
      }
    }
    fetch()
  }, [publicKey])

  const handleChangeCollRatio = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setCollRatio(newValue)
    }
  }

  const onEdit = () => {
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <PositionInfo positionInfo={positionInfo} />
      </Grid>
      <Grid item xs={12} md={8}>
        <Box sx={{ padding: '30px', color: '#fff' }}>
          <Box>
            <SubTitle>(1) Edit collateral amount</SubTitle>
            <SubTitleComment>Editing collateral amount will change the concentration range</SubTitleComment>
            <PairInput tickerIcon={ethLogo} tickerName="USD Coin" tickerSymbol="USDC" value={fromAmount} />
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>(2) Edit liquidity concentration range</SubTitle>
            <SubTitleComment>Editing concentration range will effect the collateral amount</SubTitleComment>
            <ConcentrationRange />

            <Stack direction="row" spacing={2} justifyContent="space-around">
              <Box>
                <Box sx={{ fontSize: '15px', fontWeight: '500', color: '#00f0ff', textAlign: 'center' }}>Lower Limit</Box>
                <Box sx={{ borderRadius: '10px', border: 'solid 1px #00f0ff', padding: '27px' }}>
                  <PriceValue>80.95</PriceValue>
                  <RangePair>USD / SOL</RangePair>
                </Box>
              </Box>
              <Box>
                <Box sx={{ fontSize: '15px', fontWeight: '500', color: '#FFF', textAlign: 'center' }}>Center Price</Box>
                <Box sx={{ borderRadius: '10px', border: 'solid 1px #FFF', padding: '27px' }}>
                  <PriceValue>110.78</PriceValue>
                  <RangePair>USD / SOL</RangePair>
                </Box>
              </Box>
              <Box>
                <Box sx={{ fontSize: '15px', fontWeight: '500', color: '#809cff', textAlign: 'center' }}>Upper Limit</Box>
                <Box sx={{ borderRadius: '10px', border: 'solid 1px #809cff', padding: '27px' }}>
                  <PriceValue>120.95</PriceValue>
                  <RangePair>USD / SOL</RangePair>
                </Box>
              </Box>
            </Stack>
          </Box>
          <StyledDivider />

          <ActionButton onClick={onEdit}>Edit</ActionButton>
        </Box>
      </Grid>
    </Grid>
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
  marginBottom: 17px;
  color: #fff;
`

const SubTitleComment = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #989898;
  marginBottom: 18px;
`

const PriceValue = styled('div')`
  font-size: 20px;
  font-weight: 500;
  text-align: center;
`

const RangePair = styled('div')`
  font-size: 13px;
  font-weight: 500;
`

const ActionButton = styled(Button)`
  width: 100%;
  background: #7d7d7d;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
`

export default EditPanel