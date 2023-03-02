import { styled, Box, Stack, Typography } from '@mui/material'
import WarningMsg from '~/components/Common/WarningMsg';

interface Props {
  minRatio: number
  ratio: number
}

const CollRatioBar: React.FC<Props> = ({ minRatio, ratio }) => {
  const collRatio = ratio
  let isOverMax = false
  if (ratio > 250) {
    isOverMax = true
    ratio = 250
  }
  const hasRiskRatio = ratio - minRatio <= 25
  let ratioPoint = ratio && minRatio ? 337 * (ratio - minRatio) / 100 - 45 : -45

  return (
    <Box>
      <Box mb='15px'><Typography variant='p_xxlg' style={hasRiskRatio ? { color: '#ed2525' } : {}}>{collRatio.toFixed(2)}%</Typography></Box>
      <Stack direction='row' alignItems='flex-end' justifyContent='center' p='12px' mb='15px'>
        <MinMaxVal><Box>{minRatio?.toFixed(0)}%</Box><Box>(Min)</Box></MinMaxVal>
        <Box width='337px'>
          <RatioPointer sx={{ marginLeft: `${ratioPoint}px` }}>
            <Box display='flex' justifyContent='center'>
              {isOverMax && <Typography variant='p_lg'>{`>`}</Typography>}
              <Typography variant='p_lg'>{ratio && !isNaN(ratio) ? ratio.toFixed(0) : 0}%</Typography>
            </Box>
          </RatioPointer>
          <RatioBar />
        </Box>
        <MinMaxVal><Box>250%</Box><Box>(Safe)</Box></MinMaxVal>
      </Stack>
      {hasRiskRatio && <WarningMsg><Typography variant='p' ml='8px'>This position have high possibility to become subject to liquidation. It is recommended that you provide more collateral or repay some of the borrowed amount.</Typography></WarningMsg>}
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
    left: 27px;
    top: -5px;
  }
`
const MinMaxVal = styled(Box)`
  font-size: 11px;
  font-weight: 500;
  color: ${(props) => props.theme.palette.text.secondary};
  line-height: 12px;
  margin-bottom: -12px;
  margin-right: 3px;
  margin-left: 3px;
`
const RatioBar = styled(Box)`
  width: 100%;
  height: 4px;
  background-image: ${(props) => props.theme.gradients.temperatureH2L};
`
export default CollRatioBar
