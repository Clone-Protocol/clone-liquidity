import { styled, Stack, Box, Button } from '@mui/material'
import InfoTooltip from '~/components/Common/InfoTooltip'
import Image from 'next/image'

interface Props {
}

const SelectedPoolBox: React.FC<Props> = ({}) => {
  return (
    <Box>
      <Box>
        <SubTitle>Selected liquidity pool:</SubTitle>
        <PairBox>
          <Image src={'/images/assets/USDi.png'} width="28px" height="28px" />
          <Box sx={{ marginLeft: '9px' }}>
            <span style={{ fontSize: '18px' }}>iSOL</span> / USDi
          </Box>
        </PairBox>
      </Box>
      <DetailBox>
        <SubTitle>Total collateral value <InfoTooltip title="Total collateral value" /></SubTitle>
        <div style={{ marginBottom: '15px' }}>$90,405.52</div>

        <SubTitle>Mulipool Comet Health Score <InfoTooltip title="Mulipool Comet Health Score" /></SubTitle>
        <div style={{ textAlign: 'center' }}><span style={{ fontSize: '20px' }}>75</span>/100</div>
      </DetailBox>
    </Box>
  )
}

const PairBox = styled(Box)`
  width: 250px;
  height: 63px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  border: 1px solid transparent;
  border-image-slice: 1;
  background-image: linear-gradient(to bottom, #2d2d2d, #2d2d2d), linear-gradient(to bottom, #8c73ac 0%, #7d17ff 100%);
  background-origin: border-box;
  background-clip: content-box, border-box;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-top: 7px;
`

const SubTitle = styled('div')`
	font-size: 12px;
	font-weight: 500;
	color: #989898;
`

const DetailBox = styled(Box)`
  width: 250px;
  padding: 14px 20px;
  border-radius: 10px;
  border: solid 1px #323232;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  margin-top: 25px;
`

export default SelectedPoolBox