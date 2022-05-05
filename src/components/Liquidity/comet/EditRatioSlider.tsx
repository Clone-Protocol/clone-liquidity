import React, { useState } from 'react'
import { Box, Slider, Stack, styled } from '@mui/material'
import { PositionInfo as PI } from '~/features/MyLiquidity/CometPosition.query'
import Image from 'next/image'

interface Props {
	min?: number
	max?: number
	ratio: number
  currentRatio: number
  assetData: PI
  mintAmount: number
  currentMintAmount: number
	onChange?: (newRatio: number, mintAmount: number) => void
}

const StyledSlider = styled(Slider)(({ theme }) => ({
	color: '#FFF',
	height: 4,
	padding: '13px 0',
	marginTop: '13px',
	'& .MuiSlider-thumb': {
		height: 20,
		width: 20,
		backgroundColor: '#fff',
		border: '3px solid #809cff',
		'&:hover': {
			boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
		},
	},
	'& .MuiSlider-track': {
		height: 3,
    border: 'none',
    background: 'linear-gradient(to left, #f00 -12%, #809cff 66%)'
	},
  '& .MuiSlider-valueLabel': {
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px 4px 8px',
    borderRadius: '10px',
    border: 'solid 1px #809cff',
    backgroundColor: '#000',
    '&:before': { display: 'none' },
  },
	'& .MuiSlider-rail': {
		color: '#444444',
		height: 3,
	},
}))

const EditRatioSlider: React.FC<Props> = ({ min = 0, max = 200, ratio, currentRatio, assetData, mintAmount, currentMintAmount, onChange }) => {
  const [ratioArr, setRatioArr] = useState([currentRatio])

	const valueLabelFormat = (value: number) => {
		return `${value}%`
	}

  const handleChangeCollRatio = (event: Event, newValue: number | number[]) => {
		if (typeof newValue === 'number') {
      // setRatioArr([currentRatio, newValue])

      onChange && onChange(newValue, mintAmount)
		}
	}

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value) {
			const amount = parseFloat(e.currentTarget.value)
      onChange && onChange(ratio, amount)
    }
  }

	return (
		<Box>
			<Box width="100%" display="flex">
        <SliderTxt sx={{ marginRight: '8px' }}>Min</SliderTxt>
				<StyledSlider
					value={ratio}
					min={min}
					step={10}
					max={max}
					valueLabelFormat={valueLabelFormat}
					onChange={handleChangeCollRatio}
					valueLabelDisplay="on"
				/>
        <SliderTxt sx={{ marginLeft: '8px' }}>Max</SliderTxt>
			</Box>
      <Box sx={{ display: 'flex', justifyContent: "center", marginTop: '20px' }}>
        <Stack direction="row" gap={2}>
          <StyledBox>
            <FormBox>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box display="flex">
                  <Image src={'/images/assets/USDi.png'} width="28px" height="28px" />
                  <Box sx={{ width: '80px', marginLeft: '8px', textAlign: 'left' }}>
                    USDi
                  </Box>
                </Box>
                <InputAmount id="ip-amount" type="number" sx={ mintAmount && mintAmount > 0 ? { color: '#fff' } : { color: '#adadad' }} value={mintAmount} onChange={handleChangeAmount} />
              </Stack>
            </FormBox>
            <BottomBox>Current: {currentMintAmount.toLocaleString()} USDi</BottomBox>
          </StyledBox>
          <StyledBox>
            <FormBox sx={{ background: '#252627', color: '#9a9a9a'}}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box display="flex">
                  <Image src={assetData.tickerIcon} width="28px" height="28px" />
                  <Box sx={{ width: '80px', marginLeft: '8px', textAlign: 'left' }}>
                    {assetData.tickerSymbol}
                  </Box>
                </Box>
                <Box>{(mintAmount/assetData.price).toLocaleString()}</Box>
              </Stack>
            </FormBox>
            <BottomBox>Current: {(currentMintAmount/assetData.price).toLocaleString()} {assetData.tickerSymbol}</BottomBox>
          </StyledBox>
        </Stack>
      </Box>
		</Box>
	)
}

const StyledBox = styled(Box)`
  border-radius: 10px;
  border: solid 1px #444;
  width: 244px;
  margin-top: 8px;
`

const SliderTxt = styled('div')`
  display: flex;
  align-items: flex-end;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 8px;
`

const FormBox = styled(Box)`
  height: 54px; 
  padding: 14px 12px;
  font-size: 14px;
  font-weight: 600;
  font-stretch: normal;
  background: #323436;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`

const BottomBox = styled(Box)`
  height: 23px;
  background: #252627;
  font-size: 11px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #949494;
  padding-top: 3px;
  border: 1px solid #444;
`

const InputAmount = styled(`input`)`
	width: 60px;
	margin-left: 10px;
	text-align: right;
	border: 0px;
	background-color: #323436;
	font-size: 14px;
	font-weight: 600;
	color: #adadad;
`

export default EditRatioSlider
