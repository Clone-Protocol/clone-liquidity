import { Box, Slider, Stack, styled, Typography } from '@mui/material'
import { PositionInfo as PI } from '~/features/MyLiquidity/CometPosition.query'
import Image from 'next/image'
import chroma from 'chroma-js'

interface Props {
  min?: number
  max?: number
  ratio: number
  currentRatio: number
  assetData: PI
  mintAmount: number
  currentMintAmount: number
  onChangeRatio?: (newRatio: number) => void
  onChangeAmount?: (mintAmount: number) => void
}

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: '#FFF',
  height: 4,
  padding: '13px 0',
  marginTop: '13px',
  '& .MuiSlider-thumb': {
    zIndex: 30,
    height: 20,
    width: 20,
    backgroundColor: '#fff',
    border: '3px solid #809cff',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
    },
  },
  '& .MuiSlider-track': {
    zIndex: 10,
    height: 3,
    border: 'none',
    background: 'linear-gradient(to left, #ff8e4f 0%, #fff 100%)'
  },
  '& .MuiSlider-valueLabel': {
    fontSize: '12px',
    fontWeight: '500',
    marginTop: '5px',
    padding: '4px 8px',
    border: 'solid 1px #fff',
    background: 'unset',
    '&:before': { display: 'none' },
  },
  '& .MuiSlider-rail': {
    zIndex: 10,
    color: '#444444',
    height: 3,
  },
}))

const EditRatioSlider: React.FC<Props> = ({ min = 0, max = 200, ratio, currentRatio, assetData, mintAmount, currentMintAmount, onChangeRatio, onChangeAmount }) => {
  const valueLabelFormat = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const pickHex = (x: number) => {
    const f = chroma.scale(['#fff', '#ff8e4f']).gamma(2)
    const rgb = f(x / 100).css()
    return rgb
  }

  const handleChangeMintRatio = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      onChangeRatio && onChangeRatio(newValue)
    }
  }

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value) {
      const amount = parseFloat(e.currentTarget.value)
      onChangeAmount && onChangeAmount(amount)
    }
  }

  return (
    <Box>
      <Box width="100%" display="flex" sx={{ alignItems: 'center' }}>
        <SliderTxt mr='14px' mt='10px'><div>0%</div> <div>(Min)</div></SliderTxt>
        <Box sx={{ width: '100%', height: '48px' }}>
          <StyledSlider
            sx={{
              '& .MuiSlider-valueLabel': {
                border: `solid 1px ${pickHex(ratio)}`,
              },
              '& .MuiSlider-thumb': {
                border: `0px`,
              },
              '& .MuiSlider-track': {
                background: `linear-gradient(to left, #ff8e4f 0%, #fff ${ratio}%)`
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
          <Box sx={{ position: 'relative', zIndex: '20', top: '-32px', left: `calc(${currentRatio.toFixed(1)}% - 10px)` }}>
            <FixThumb />
            <FixValueLabel>{currentRatio.toFixed(1)}%</FixValueLabel>
          </Box>
        </Box>
        <SliderTxt ml='14px' mt='10px'><div>100%</div> <div>(Max)</div></SliderTxt>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: "center", marginTop: '25px' }}>
        <Stack direction="row" gap={1}>
          <StyledBox>
            <FormBox sx={{ background: '#363636' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems='center'>
                  <Image src={'/images/assets/on-usd.png'} width="28px" height="28px" />
                  <Box marginLeft='8px'>
                    <Typography variant='p_lg'>onUSD</Typography>
                  </Box>
                </Box>
                <Box lineHeight='20px'>
                  <InputAmount id="ip-amount" type="number" min={0} sx={mintAmount && mintAmount > 0 ? { color: '#fff' } : { color: '#adadad' }} placeholder="0.00" value={parseFloat(mintAmount.toFixed(4))} onChange={handleChangeAmount} />
                  <MintAmount>${mintAmount.toLocaleString()} USD</MintAmount>
                </Box>
              </Stack>
            </FormBox>
            <BottomBox><Typography variant='p' color='#989898'>Current: </Typography> <Typography variant='p'>{currentMintAmount.toLocaleString()} onUSD</Typography></BottomBox>
          </StyledBox>
          <StyledBox>
            <FormBox>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems='center'>
                  <Image src={assetData.tickerIcon} width="28px" height="28px" />
                  <Box marginLeft='8px'>
                    <Typography variant='p_lg'>{assetData.tickerSymbol}</Typography>
                  </Box>
                </Box>
                <Box textAlign='right' lineHeight='20px'>
                  <Typography variant='p_xlg'>{(mintAmount / assetData.price).toLocaleString()}</Typography>
                  <MintAmount>${mintAmount.toLocaleString()} USD</MintAmount>
                </Box>
              </Stack>
            </FormBox>
            <BottomBox><Typography variant='p' color='#989898'>Current: </Typography> <Typography variant='p'>{(currentMintAmount / assetData.price).toLocaleString(undefined, { maximumFractionDigits: 3 })} {assetData.tickerSymbol}</Typography></BottomBox>
          </StyledBox>
        </Stack>
      </Box>
    </Box>
  )
}

const StyledBox = styled(Box)`
  border: solid 1px ${(props) => props.theme.boxes.blackShade};
  width: 215px;
  margin-top: 8px;
`
const SliderTxt = styled(Box)`
  width: 30px;
  font-size: 11px;
  font-weight: 500;
  color: ${(props) => props.theme.palette.text.secondary};
  margin-bottom: 8px;
  line-height: 13px;
`
const FixThumb = styled('div')`
  width: 20px;
  height: 20px;
  background-color: #fff;
  border-radius: 99999px;
  border: 3px solid #fff;
`
const FixValueLabel = styled(Box)`
  width: 51px;
  height: 24px;
  padding: 2px 8px;
  margin-top: 8px;
  margin-left: -16px;
  border: solid 1px ${(props) => props.theme.palette.text.secondary};
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: ${(props) => props.theme.palette.text.secondary};
`
const FormBox = styled(Box)`
  height: 63px; 
  padding: 12px;
`
const BottomBox = styled(Box)`
  height: 30px;
  text-align: center;
  border-top: 1px solid ${(props) => props.theme.boxes.blackShade};
`
const InputAmount = styled(`input`)`
	max-width: 100px;
	margin-left: 10px;
	text-align: right;
	border: 0px;
	background-color: ${(props) => props.theme.boxes.blackShade};
	font-size: 17.3px;
	font-weight: 500;
`
const MintAmount = styled('div')`
  font-size: 12px; 
  font-weight: 500;
  text-align: right; 
  color: ${(props) => props.theme.palette.text.secondary}; 
`

export default EditRatioSlider
