import React, { useState } from 'react'
import { Grid, Box, Stack, Divider, Button } from '@mui/material'
import { styled } from '@mui/system'
import PositionInfo from '~/components/Liquidity/comet/PositionInfo'
import PairInput from '~/components/Borrow/PairInput'
import ethLogo from '../../../../public/images/assets/ethereum-eth-logo.svg'
import RatioSlider from '~/components/Borrow/RatioSlider'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'

const EditPanel = () => {
  const [fromAmount, setFromAmount] = useState(0.0)
  const [toAmount, setToAmount] = useState(0.0)
  const [collRatio, setCollRatio] = useState(150)

  const onEdit = () => {
  }

  const handleChangeCollRatio = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setCollRatio(newValue)
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <PositionInfo />
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
                <Box sx={{ fontSize: '15px', fontWeight: '500', color: '#00f0ff' }}>Lower Limit</Box>
                <Box sx={{ borderRadius: '10px', border: 'solid 1px #00f0ff', padding: '27px' }}>
                  <div>80.95</div>
                  <div>USD / SOL</div>
                </Box>
              </Box>
              <Box>
                <Box sx={{ fontSize: '15px', fontWeight: '500', color: '#FFF' }}>Center Price</Box>
                <Box sx={{ borderRadius: '10px', border: 'solid 1px #FFF', padding: '27px' }}>
                  <div>110.78</div>
                  <div>USD / SOL</div>
                </Box>
              </Box>
              <Box>
                <Box sx={{ fontSize: '15px', fontWeight: '500', color: '#809cff' }}>Upper Limit</Box>
                <Box sx={{ borderRadius: '10px', border: 'solid 1px #809cff', padding: '27px' }}>
                  <div>120.95</div>
                  <div>USD / SOL</div>
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

const ActionButton = styled(Button)`
  width: 100%;
  background: #7d7d7d;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
`

export default EditPanel