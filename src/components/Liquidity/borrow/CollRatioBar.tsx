import { styled, Box, Stack, Typography } from '@mui/material'
import WarningMsg from '~/components/Common/WarningMsg';

interface Props {
  hasRiskRatio: boolean
  minRatio: number
  ratio: number
  prevRatio?: number
}

const CollRatioBar: React.FC<Props> = ({ hasRiskRatio = false, minRatio, ratio, prevRatio }) => {
  const collRatio = ratio
  let isOverMax = false
  if (ratio > 250) {
    isOverMax = true
    ratio = 250
  }
  const ratioPoint = ratio && minRatio ? 337 * (ratio - minRatio) / 100 - 40 : -40
  const prevRatioPoint = prevRatio && minRatio ? 337 * (prevRatio - minRatio) / 100 - 41 : -41

  return (
    <Box>
      <Box mb='10px'><Typography variant='p_xxlg' style={hasRiskRatio ? { color: '#ed2525' } : {}}>{collRatio.toFixed(2)}%</Typography></Box>
      <Stack direction='row' alignItems='center' justifyContent='center' p='12px' mb='15px'>
        <MinMaxVal><Box>{minRatio?.toFixed(0)}%</Box><Box>(Min)</Box></MinMaxVal>
        <Box width='337px' height='85px'>
          <RatioPointer sx={{ marginLeft: `${ratioPoint}px` }}>
            <Box display='flex' justifyContent='center'>
              {isOverMax && <Typography variant='p_lg'>{`>`}</Typography>}
              <Typography variant='p_lg'>{ratio && !isNaN(ratio) ? ratio.toFixed(2) : 0}%</Typography>
            </Box>
          </RatioPointer>
          <RatioBar />
          {prevRatio &&
            <PrevBox sx={{ left: `${prevRatioPoint}px` }}>
              <FixValueLabel><Typography variant='p' mr='6px'>{prevRatio?.toFixed(2)}%</Typography></FixValueLabel>
              <Box mt='-7px'><Typography variant='p_sm' color='#989898'>Current</Typography></Box>
            </PrevBox>
          }
        </Box>
        <MinMaxVal><Box>250%+</Box><Box>(Safe)</Box></MinMaxVal>
      </Stack>
      {hasRiskRatio && <WarningMsg>This position have high possibility to become subject to liquidation. It is recommended that you provide more collateral or repay some of the borrowed amount.</WarningMsg>}
    </Box>
  )
}

const RatioPointer = styled(Box)`
  margin-left: -10px;
  margin-right: -10px;
  width: 83px;
  height: 28px;
  padding: 3px 6px;
  border: solid 1px #fff;
  margin-bottom: 13px;
  &::after {
    content: '▼';
    position: relative;
    left: 25px;
    top: -4px;
  }
`
const MinMaxVal = styled(Box)`
  font-size: 11px;
  font-weight: 500;
  color: ${(props) => props.theme.palette.text.secondary};
  line-height: 12px;
  margin-right: 3px;
  margin-left: 3px;
`
const RatioBar = styled(Box)`
  width: 100%;
  height: 4px;
  background-image: ${(props) => props.theme.gradients.temperatureH2L};
`
const PrevBox = styled(Box)`
  position: relative; 
  width: 83px;
  text-align: center;
  z-index: 20;
`
const FixValueLabel = styled(Box)`
  width: 100%;
  height: 28px;
  padding: 2px 8px;
  margin-top: 8px;
  border: solid 1px ${(props) => props.theme.palette.text.secondary};
  font-size: 12px;
  font-weight: 500;
  line-height: 24px;
  color: ${(props) => props.theme.palette.text.secondary};
  &::before {
    content: '▲';
    position: relative;
    left: 26px;
    top: -18px;
  }
`
export default CollRatioBar
