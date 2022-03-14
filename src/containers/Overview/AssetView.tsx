import { Box, Stack, Button, Paper, Divider, Tabs, Tab } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import PairInput from '~/components/Borrow/PairInput'
import ethLogo from 'public/images/assets/ethereum-eth-logo.svg'
import RatioSlider from '~/components/Borrow/RatioSlider'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'
import InfoBookIcon from 'public/images/info-book-icon.png'
import WarningIcon from 'public/images/warning-icon.png'
import { TabPanelProps, StyledTabs, StyledTab } from '~/components/Common/StyledTab'
import { useIncept } from '~/hooks/useIncept'
import { useWallet } from '@solana/wallet-adapter-react'
import { PositionInfo as PI, fetchCometDetail } from '~/web3/MyLiquidity/CometPosition'
import { fetchBalance } from '~/web3/Comet/balance'

const AssetView = () => {
  const { publicKey } = useWallet()
  const { getInceptApp } = useIncept()
  const [positionInfo, setPositionInfo] = useState<PI>()
  const [tab, setTab] = useState(0)
  const [fromAmount, setFromAmount] = useState(0.0)
  const [toAmount, setToAmount] = useState(0.0)
  const [collRatio, setCollRatio] = useState(150)
  const [assetIndex, setAssetIndex] = useState(0)
  const [usdiBalance, setUsdiBalance] = useState(0)

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

      const balance = await fetchBalance({
        program,
        userPubKey: publicKey
      })
      if (balance) {
        setUsdiBalance(balance.balanceVal)
      }
    }
    fetch()
  }, [publicKey])

  const handleChangeTab = (event: React.SyntheticEvent, newVal: number) => {
    setTab(newVal)
  }

  const handleChangeCollRatio = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setCollRatio(newValue)
    }
  }

  const onComet = () => {

  }

  const onLiquidity = () => {

  }

  const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <div>{children}</div>
          </Box>
        )}
      </div>
    );
  }

  return (
    <StyledPaper variant="outlined">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <StyledTabs value={tab} onChange={handleChangeTab} aria-label="basic tabs example">
          <StyledTab label="Commet Liquidity" />
          <StyledTab label="Unconcentrated Liquidity" />
        </StyledTabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <Box>
          <PriceIndicatorBox tickerIcon={ethLogo} tickerName="iSolana" tickerSymbol="iSOL" value={positionInfo?.aPrice} />

          <Stack sx={{ border: '1px solid #00d0dd', borderRadius: '10px', color: '#9d9d9d', padding: '12px', marginTop: '19px', marginBottom: '30px' }} direction="row">
            <Box sx={{ width: '73px', textAlign: 'center', marginTop: '11px' }}><Image src={InfoBookIcon} /></Box>
            <Box>Fill in two of the three parts and the third part will automatically generate. Learn more here.</Box>
          </Stack>

          <Box>
            <SubTitle>(1) Provide stable coins to collateralize</SubTitle>
            <PairInput tickerIcon={ethLogo} tickerName="USDi Coin" tickerSymbol="USDi" value={fromAmount}  balance={usdiBalance}/>
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>(2) Amount of USDi-iSOL to mint into iSOL AMM</SubTitle>
            {/* <RatioSlider min={0} max={100} value={collRatio} onChange={handleChangeCollRatio} /> */}
            <PairInput tickerIcon={ethLogo} tickerName="Incept USD" tickerSymbol="USDi" value={toAmount}  balance={usdiBalance}/>
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>(3) Liquidity concentration range</SubTitle>

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

            <Button sx={{ width: '100%', color: '#fff', borderRadius: '10px', border: 'solid 1px #fff', marginTop: '26px'}}>Unconcentrated Liquidity</Button>
          </Box>
          <StyledDivider />

          <CometButton onClick={onComet}>Create Comet Position</CometButton>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Box>
          <PriceIndicatorBox tickerIcon={positionInfo?.tickerIcon} tickerName={positionInfo?.tickerName} tickerSymbol={positionInfo?.tickerSymbol} value={positionInfo?.aPrice} />

          <Stack sx={{ border: '1px solid #e9d100', borderRadius: '10px', color: '#9d9d9d', padding: '12px', marginTop: '19px', marginBottom: '30px' }} direction="row">
            <Box sx={{ width: '73px', textAlign: 'center', marginTop: '11px' }}><Image src={WarningIcon} /></Box>
            <Box>Unconcentrated liquidity positions are less capital efficent than coment liquidity. Learn more here.</Box>
          </Stack>

          <Box>
            <SubTitle>(1) Provide iSOL</SubTitle>
            <SubTitleComment>Acquire iSOL by Borrowing</SubTitleComment>
            <PairInput tickerIcon={ethLogo} tickerName="USDi Coin" tickerSymbol="USDi" value={fromAmount} />
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>(2) Provide USDi</SubTitle>
            <SubTitleComment>An equivalent USDi amount must be provided</SubTitleComment>
            <PairInput tickerIcon={ethLogo} tickerName="USDi Coin" tickerSymbol="USDi" value={fromAmount} />
          </Box>
          <StyledDivider />

          <LiquidityButton onClick={onLiquidity}>Create Liquidity Position</LiquidityButton>
        </Box>
      </TabPanel>
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
  padding-left: 30px;
  padding-top: 36px;
  padding-bottom: 42px;
  padding-right: 33px;
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

const PriceValue = styled('div')`
  font-size: 20px;
  font-weight: 500;
  text-align: center;
`

const RangePair = styled('div')`
  font-size: 13px;
  font-weight: 500;
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
  background-color: #7d7d7d;
  color: #fff;
  border-radius: 10px;
  margin-bottom: 15px;
`


export default AssetView