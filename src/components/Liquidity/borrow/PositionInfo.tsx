import { Box, Stack, Button, Divider, Card } from '@mui/material'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import ethLogo from 'public/images/assets/ethereum-eth-logo.svg'
import PriceIndicatorBox from '~/components/Asset/PriceIndicatorBox'
import WarningIcon from 'public/images/warning-icon-red.png'
import Image from 'next/image'

interface Props {
}

const PositionInfo: React.FC = () => {

  return (
    <Box sx={{ background: '#000', color: '#fff' }}>
      <PriceIndicatorBox tickerIcon={ethLogo} tickerName="iSolana" tickerSymbol="iSOL" value={111.01} />

      <Box sx={{ background: '#171717', color: '#fff', padding: '25px', marginTop: '15px' }}>
        <WarningBox><Image src={WarningIcon} /> High liquidation risk</WarningBox>

        <Title>Borrow Position</Title>
        <Box>
          <Box>
            <SubTitle>Current collateral</SubTitle>
            <Box sx={{ fontSize: '16px', fontWeight: '500' }}>
              179.49 USDC
            </Box>
            
            <SubTitle>Current collateral ratio</SubTitle>
            <Box sx={{ fontSize: '16px', fontWeight: '500', color: '#ff2929' }}>
              121.74% (min: 120%)
            </Box>

            <SubTitle>Borrowed amount</SubTitle>
            <Box sx={{ fontSize: '16px', fontWeight: '500' }}>
              1.00 iLTC
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const WarningBox = styled(Box)`
  font-size: 12px;
  font-weight: 500;
  color: #ff2929;
  padding: 3px 29px 2px 46px;
  border-radius: 10px;
  border: solid 1px #f00;
  text-align: center;
  margin-bottom: 20px;
`

const Title = styled('div')`
  font-size: 20px;
  font-weight: 600;
  color: #FFF;
  margin-bottom: 20px;
`

const SubTitle = styled('div')`
  font-size: 14px;
  font-weight: 500;
  color: #989898;
  margin-top: 10px;
  margin-bottom: 10px;
`

export default withCsrOnly(PositionInfo)