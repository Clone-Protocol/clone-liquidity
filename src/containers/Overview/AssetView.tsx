import { Box, Stack, Button, Paper, Divider, Tabs, Tab } from '@mui/material'
import React, { useState } from 'react'
import { styled } from '@mui/system'
import Image from 'next/image'
import PairInput from '~/components/Borrow/PairInput'
import ethLogo from '../../../public/images/assets/ethereum-eth-logo.svg'
import RatioSlider from '~/components/Borrow/RatioSlider'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import ConcentrationRange from '~/components/Liquidity/comet/ConcentrationRange'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface StyledTabsProps {
  children?: React.ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

interface StyledTabProps {
  label: string;
}

const StyledTabs = styled((props: StyledTabsProps) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: '#635ee7',
  },
});

const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: 'none',
  fontWeight: '500',
  fontSize: '18px',
  marginRight: theme.spacing(1),
  color: '#989898',
  '&.Mui-selected': {
    color: '#fff',
  },
  '&.Mui-focusVisible': {
    backgroundColor: '#3d3d3d',
  },
}));

const AssetView = () => {
  const [tab, setTab] = useState(0)
  const [fromAmount, setFromAmount] = useState(0.0)
  const [toAmount, setToAmount] = useState(0.0)
  const [collRatio, setCollRatio] = useState(150)

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
          <PriceIndicatorBox tickerIcon={ethLogo} tickerName="iSolana" tickerSymbol="iSOL" value={111.01} />

          <Stack sx={{ border: '1px solid #9d9d9d', borderRadius: '10px', color: '#9d9d9d', padding: '12px', marginTop: '19px' }} direction="row">
            <Box>xx</Box>
            <Box>Fill in two of the three parts and the third part will automatically generate. Learn more here.</Box>
          </Stack>

          <Box>
            <SubTitle>(1) Provide stable coins to collateralize</SubTitle>
            <PairInput tickerIcon={ethLogo} tickerName="USD Coin" tickerSymbol="USDC" value={fromAmount} />
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>(2) Amount of USDi-iSOL to mint into iSOL AMM</SubTitle>
            <RatioSlider value={collRatio} onChange={handleChangeCollRatio} />
            <PairInput tickerIcon={ethLogo} tickerName="Incept USD" tickerSymbol="USDi" value={toAmount} />
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>(3) Liquidity concentration range</SubTitle>

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

            <Button sx={{ width: '100%', color: '#fff', borderRadius: '10px', border: 'solid 1px #fff', marginTop: '26px'}}>Unconcentrated Liquidity</Button>
          </Box>
          <StyledDivider />

          <ActionButton onClick={onComet}>Create Comet Position</ActionButton>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Box>
          <PriceIndicatorBox tickerIcon={ethLogo} tickerName="iSolana" tickerSymbol="iSOL" value={111.01} />

          <Stack sx={{ border: '1px solid #9d9d9d', borderRadius: '10px', color: '#9d9d9d', padding: '12px', marginTop: '19px' }} direction="row">
            <Box>xx</Box>
            <Box>Unconcentrated liquidity positions are less capital efficent than coment liquidity. Learn more here.</Box>
          </Stack>

          <Box>
            <SubTitle>(1) Provide iSOL</SubTitle>
            <SubTitleComment>Acquire iSOL by Borrowing</SubTitleComment>
            <PairInput tickerIcon={ethLogo} tickerName="USD Coin" tickerSymbol="USDC" value={fromAmount} />
          </Box>
          <StyledDivider />

          <Box>
            <SubTitle>(2) Provide USDi</SubTitle>
            <SubTitleComment>An equivalent USDi amount must be provided</SubTitleComment>
            <PairInput tickerIcon={ethLogo} tickerName="USD Coin" tickerSymbol="USDC" value={fromAmount} />
          </Box>
          <StyledDivider />

          <ActionButton onClick={onLiquidity}>Create Liquidity Position</ActionButton>
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
  padding-left: 53px;
  padding-top: 56px;
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
  marginBottom: 17px;
`

const SubTitleComment = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #989898;
  marginBottom: 18px;
`

const ActionButton = styled(Button)`
  width: 100%;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), linear-gradient(to right, #00f0ff -1%, #0038ff 109%);
  color: #fff;
  border-radius: 10px;
  margin-bottom: 15px;
`

export default AssetView