import { Box, Slider, Stack, Typography, styled } from '@mui/material'
import { PositionInfo } from '~/features/MyLiquidity/comet/LiquidityPosition.query'

interface Props {
  min?: number
  max?: number
  ratio: number
  currentRatio: number
  positionInfo: PositionInfo
  maxMintable: number
  totalLiquidity: number
  mintAmount: number
  currentMintAmount: number
  onChangeRatio?: (newRatio: number) => void
  onChangeAmount?: (mintAmount: number) => void
}

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: '#FFF',
  height: 5,
  marginTop: '13px',
  '& .MuiSlider-thumb': {
    zIndex: 30,
    height: 20,
    width: 20,
    backgroundColor: '#fff',
    border: '3px solid #fff',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
    },
  },
  '& .MuiSlider-track': {
    zIndex: 10,
    height: 5,
    border: 'none',
    background: 'linear-gradient(to right, #fff 51%, #ff0084 400px)'
  },
  '& .MuiSlider-valueLabel': {
    fontSize: '14px',
    fontWeight: '500',
    width: '60px',
    height: '28px',
    padding: '4px 8px',
    border: 'solid 1px #fff',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    '&:before': { display: 'none' },
  },
  '& .MuiSlider-rail': {
    zIndex: 10,
    color: '#414e66',
    height: 5,
  },
}))

const EditLiquidityRatioSlider: React.FC<Props> = ({ min = 0, max = 100, ratio, currentRatio, positionInfo, maxMintable, totalLiquidity, mintAmount, currentMintAmount, onChangeRatio, onChangeAmount }) => {
  const valueLabelFormat = (value: number) => {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
  }

  const handleChangeMintRatio = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      onChangeRatio && onChangeRatio(newValue)
    }
  }

  return (
    <Box>
      <Stack direction='row' alignItems='center' justifyContent='center' p='12px 8px'>
        <Box width='100%'>
          <StyledSlider
            sx={{
              '& .MuiSlider-track': {
                background: `linear-gradient(to right, #fff 51%, #ff0084 400px);`
              }
            }}
            value={ratio}
            min={min}
            step={1}
            max={max}
            valueLabelFormat={valueLabelFormat}
            onChange={handleChangeMintRatio}
            valueLabelDisplay="on"
          />
          <PrevBox sx={{ left: `calc(${currentRatio.toFixed(1)}% - 32px)` }}>
            <FixValueLabel><Typography variant='p_lg' ml='-12px'>{currentRatio.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</Typography></FixValueLabel>
            <Box mt='-4px'><Typography variant='p' color='#66707e'>Current</Typography></Box>
          </PrevBox>
        </Box>
      </Stack>
    </Box>
  )
}

const PrevBox = styled(Box)`
  position: relative; 
  width: 60px;
  text-align: center;
  top: -15px;
  z-index: 20;
`
const FixValueLabel = styled(Box)`
  width: 100%;
  height: 28px;
  padding: 2px 8px;
  margin-top: 8px;
  border: solid 1px ${(props) => props.theme.basis.slug};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  line-height: 22px;
  color: ${(props) => props.theme.basis.slug};
  &::before {
    content: '▲';
    position: relative;
    left: 17px;
    top: -18px;
  }
`
// const FormBox = styled(Box)`
//   height: 63px; 
//   padding: 12px;
// `
// const BottomBox = styled(Box)`
//   height: 30px;
//   text-align: center;
//   border-top: 1px solid ${(props) => props.theme.boxes.blackShade};
// `
// const InputAmount = styled(`input`)`
//   max-width: 100px;
//   margin-left: 10px;
//   text-align: right;
//   border: 0px;
//   background-color: ${(props) => props.theme.boxes.blackShade};
//   font-size: 17.3px;
//   font-weight: 500;
// `
// const MintAmount = styled('div')`
//   font-size: 12px; 
//   font-weight: 500;
//   text-align: right; 
//   color: ${(props) => props.theme.palette.text.secondary}; 
// `
export default EditLiquidityRatioSlider
