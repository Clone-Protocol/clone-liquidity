import { Box, Stack, Button, Paper, Divider, Tabs, Tab, Grid } from '@mui/material'
import React, { useState } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import PairInput from '~/components/Asset/PairInput'
import PairInputView from '~/components/Asset/PairInputView'
import ethLogo from 'public/images/assets/ethereum-eth-logo.svg'
import RatioSlider from '~/components/Borrow/RatioSlider'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import InfoBookIcon from 'public/images/info-book-icon.png'
import WarningIcon from 'public/images/warning-icon.png'
import OneIcon from 'public/images/one-icon.png'
import TwoIcon from 'public/images/two-icon.png'
import ThreeIcon from 'public/images/three-icon.png'
import CometIcon from 'public/images/comet-icon.png'
import UnconcentIcon from 'public/images/ul-icon.png'
import { AssetData, fetchAsset, UnconcentratedData, fetchUnconcentrated } from '~/features/Overview/Asset.query'

const AssetView = () => {
  const [tab, setTab] = useState(0)
  //comet liquidity
  const [assetData, setAssetData] = useState<AssetData>(fetchAsset())
  //unconcentrated liquidity
  const [unconcentData, setUnconcentData] = useState<UnconcentratedData>(fetchUnconcentrated())

  const changeTab = (newVal: number) => {
    setTab(newVal)
  }

  /** Comet Liquidity */

  const handleChangeFromAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newData
		if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)
      // TODO: to bind with contract
      const lowerLimit = 20
      const upperLimit = 160

      newData = {
        ...assetData,
        collAmount: amount,
        lowerLimit,
        upperLimit
      }
		} else {
      newData = {
        ...assetData,
        collAmount: 0.0
      }
		}
    setAssetData(newData)
	}

  const handleChangeCollRatio = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      // TODO: to bind with contract
      const lowerLimit = 20
      const upperLimit = 160

      const newData = {
        ...assetData,
        collRatio: newValue,
        lowerLimit,
        upperLimit
      }
      setAssetData(newData)
    }
  }

  const handleChangeToAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newData
		if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)
      // TODO: to bind with contract
      const lowerLimit = 20
      const upperLimit = 160

      newData = {
        ...assetData,
        mintAmount: amount,
        lowerLimit,
        upperLimit
      }
		} else {
      newData = {
        ...assetData,
        mintAmount: 0.0
      }
		}
    setAssetData(newData)
	}

  const handleChangeConcentRange = (isTight: boolean, lowerLimit: number, upperLimit: number) => {
    const newData = {
      ...assetData,
      isTight,
      lowerLimit,
      upperLimit
    }
    setAssetData(newData)
  }

  const onComet = () => {
    console.log('assetData', assetData)
  }


  /** Unconcentrated Liquidity */

  const handleBorrowFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newData
		if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)
      newData = {
        ...unconcentData,
        borrowFrom: amount
      }
		} else {
      newData = {
        ...unconcentData,
        borrowFrom: 0.0
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
        borrowTo: amount
      }
		} else {
      newData = {
        ...unconcentData,
        borrowTo: 0.0
      }
		}
    setUnconcentData(newData)
  }

  const onLiquidity = () => {
    console.log('unconcentData', unconcentData)
  }

  return (
    <StyledBox>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {/* <StyledTabs value={tab} onChange={handleChangeTab} aria-label="basic tabs example">
          <StyledTab label="Commet Liquidity" />
          <StyledTab label="Unconcentrated Liquidity" />
        </StyledTabs> */}
        <Box sx={{ display: 'flex' }}>
          <CometTab onClick={() => changeTab(0)}><Image src={CometIcon} /> <span style={{ marginLeft: '8px' }}>Comet Liquidity</span></CometTab>
          <UnconcentTab onClick={() => changeTab(1)}><Image src={UnconcentIcon} /><span style={{ marginLeft: '8px' }}>Unconcentrated Liquidity</span></UnconcentTab>
        </Box>
      </Box>
      <Box sx={{ paddingY: '20px' }}>
      { tab === 0 ?
        <Box>
          <PriceIndicatorBox tickerIcon={assetData.tickerIcon} tickerName={assetData.tickerName} tickerSymbol={assetData.tickerSymbol} value={assetData.price} />

          <Box sx={{ background: '#171717', paddingX: '61px', paddingY: '36px', marginTop: '28px' }}>
            <Stack sx={{ border: '1px solid #00d0dd', borderRadius: '10px', color: '#9d9d9d', padding: '12px', marginBottom: '26px' }} direction="row">
              <Box sx={{ width: '73px', textAlign: 'center', marginTop: '11px' }}><Image src={InfoBookIcon} /></Box>
              <WarningBox>Fill in two of the three parts and the third part will automatically generate. <br /> Learn more here.</WarningBox>
            </Stack>

            <Box>
              <SubTitle><Image src={OneIcon} /> <Box sx={{ marginLeft: '9px' }}>Provide stable coins to collateralize</Box></SubTitle>
              <PairInput tickerIcon={ethLogo} tickerName="USD Coin" tickerSymbol="USDC" value={assetData.collAmount} headerTitle="Balance" headerValue={0} onChange={handleChangeFromAmount} />
            </Box>
            <StyledDivider />

            <Box>
              <SubTitle><Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}>Amount of USDi-iSOL to mint into iSOL AMM</Box></SubTitle>
              <Box sx={{ marginTop: '15px' }}>
                <RatioSlider min={0} max={100} value={assetData.collRatio} onChange={handleChangeCollRatio} />
              </Box>
              <Box sx={{ marginBottom: '25px', marginTop: '15px' }}>
                <PairInput tickerIcon={ethLogo} tickerName="Incept USD" tickerSymbol="USDi" value={assetData.mintAmount} onChange={handleChangeToAmount} />
              </Box>
              <PairInputView tickerIcon={ethLogo} tickerSymbol="iSOL" value={assetData.mintAmount} />
            </Box>
            <StyledDivider />

            <Box>
              <SubTitle><Image src={ThreeIcon} /> <Box sx={{ marginLeft: '9px' }}>Liquidity concentration range</Box></SubTitle>

              <Box sx={{ marginTop: '110px', marginBottom: '15px'}}>
                <ConcentrationRange assetData={assetData} onChange={handleChangeConcentRange} />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs>
                  <Box sx={{ fontSize: '15px', fontWeight: '500', color: '#00f0ff', textAlign: 'center', marginBottom: '5px' }}>Lower Limit</Box>
                  <Box sx={{ background: 'linear-gradient(180deg, #333333 55%, #171717 45%)', borderRadius: '10px', border: 'solid 1px #00f0ff', padding: '18px' }}>
                    <PriceValue>{assetData.lowerLimit}</PriceValue>
                    <RangePair>USD / SOL</RangePair>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ fontSize: '15px', fontWeight: '500', color: '#FFF', textAlign: 'center', marginBottom: '5px' }}>Center Price</Box>
                  <Box sx={{ borderRadius: '10px', border: 'solid 1px #FFF', padding: '18px' }}>
                    <PriceValue>{assetData.centerPrice}</PriceValue>
                    <RangePair>USD / SOL</RangePair>
                  </Box>
                </Grid>
                <Grid item xs>
                  <Box sx={{ fontSize: '15px', fontWeight: '500', color: '#809cff', textAlign: 'center', marginBottom: '5px' }}>Upper Limit</Box>
                  <Box sx={{ background: 'linear-gradient(180deg, #333333 55%, #171717 45%)', borderRadius: '10px', border: 'solid 1px #809cff', padding: '18px' }}>
                    <PriceValue>{assetData.upperLimit}</PriceValue>
                    <RangePair>USD / SOL</RangePair>
                  </Box>
                </Grid>
              </Grid>

              <Button onClick={() => changeTab(1)} sx={{ width: '100%', color: '#fff', background: '#171717', borderRadius: '10px', border: 'solid 1px #fff', marginTop: '26px', height: '40px', fontSize: '15px'}}>Unconcentrated Liquidity</Button>

              { assetData.isTight ? <Stack sx={{ maxWidht: '653px', border: '1px solid #e9d100', borderRadius: '10px', color: '#9d9d9d', padding: '12px', marginTop: '19px', marginBottom: '30px' }} direction="row">
                <Box sx={{ width: '53px', textAlign: 'center', marginTop: '11px' }}><Image src={WarningIcon} /></Box>
                <WarningBox>Liquidity concentration range for this position is very slim, this results in higher potential yield and high probabily of liqudiation.</WarningBox>
              </Stack> : <></>
              }
            </Box>
            <StyledDivider />

            <CometButton onClick={onComet}>Create Comet Position</CometButton>
          </Box>
        </Box>
      : <Box>
          <PriceIndicatorBox tickerIcon={assetData.tickerIcon} tickerName={assetData.tickerName} tickerSymbol={assetData.tickerSymbol} value={assetData.price} />

          <Box sx={{ background: '#171717', paddingX: '61px', paddingY: '20px', marginTop: '28px' }}>
            <Stack sx={{ border: '1px solid #e9d100', borderRadius: '10px', color: '#9d9d9d', padding: '12px', marginTop: '19px', marginBottom: '30px' }} direction="row">
              <Box sx={{ width: '53px', textAlign: 'center', marginTop: '11px' }}><Image src={WarningIcon} /></Box>
              <WarningBox>Unconcentrated liquidity positions are less capital efficent than coment liquidity. Learn more here.</WarningBox>
            </Stack>

            <Box>
              <SubTitle><Image src={OneIcon} /> <Box sx={{ marginLeft: '9px' }}> Provide iSOL</Box></SubTitle>
              <SubTitleComment>Acquire iSOL by <span style={{color: '#fff'}}>Borrowing</span></SubTitleComment>
              <PairInput tickerIcon={ethLogo} tickerName="iSolana" tickerSymbol="iSOL" value={unconcentData.borrowFrom} headerTitle="balance" headerValue={unconcentData.borrowFromBalance} onChange={handleBorrowFrom} />
            </Box>
            <StyledDivider />

            <Box>
              <SubTitle><Image src={TwoIcon} /> <Box sx={{ marginLeft: '9px' }}> Provide USDi</Box></SubTitle>
              <SubTitleComment>An equivalent USDi amount must be provided</SubTitleComment>
              <PairInput tickerIcon={ethLogo} tickerName="USDi" tickerSymbol="USDi" value={unconcentData.borrowTo} headerTitle="balance" headerValue={unconcentData.borrowToBalance} onChange={handleBorrowTo} />
            </Box>
            <StyledDivider />

            <LiquidityButton onClick={onLiquidity}>Create Liquidity Position</LiquidityButton>
          </Box>
        </Box>
      }
      </Box>
    </StyledBox>
  )
}

const StyledBox = styled(Paper)`
  maxWidth: 768px;
  font-size: 14px;
  font-weight: 500; 
  text-align: center;
  color: #fff;
  border-radius: 8px;
  text-align: left;
  background: #000;
  padding-left: 30px;
  padding-top: 36px;
  padding-bottom: 42px;
  padding-right: 33px;
`
const StyledDivider = styled(Divider)`
  background-color: #535353;
  margin-bottom: 30px;
  margin-top: 30px;
  height: 1px;
`

const CometTab = styled(Button)`
  width: 224px;
  height: 40px;
  padding: 9px 24px 9px 24.5px;
  border-radius: 10px;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), linear-gradient(to right, #00f0ff -1%, #0038ff 109%);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`

const UnconcentTab = styled(Button)`
  width: 284px;
  height: 40px;
  border-radius: 10px;
  background-color: #171717;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`

const SubTitle = styled(Box)`
  display: flex;
  font-size: 18px;
  font-weight: 500;
`

const SubTitleComment = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #989898;
  margin-top: 10px;
`

const WarningBox = styled(Box)`
  max-width: 500px;
  padding-right: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #989898;
`

const PriceValue = styled('div')`
  font-size: 20px;
  font-weight: 500;
  text-align: center;
`

const RangePair = styled('div')`
  font-size: 13px;
  font-weight: 500;
  padding-top: 10px;
  text-align: center;
`

const CometButton = styled(Button)`
  width: 100%;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), linear-gradient(to right, #00f0ff -1%, #0038ff 109%);
  color: #fff;
  border-radius: 10px;
  margin-bottom: 15px;
`
const LiquidityButton = styled(Button)`
  width: 100%;
  background-color: #575757;
  color: #fff;
  border-radius: 10px;
  margin-bottom: 15px;
`


export default AssetView