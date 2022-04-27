import { Box, Slider, Stack, styled } from '@mui/material'
import { PositionInfo as PI } from '~/features/MyLiquidity/CometPosition.query'
import Image from 'next/image'

interface Props {
	min?: number
	max?: number
	value: number
  assetData: PI
  mintAmount: number
	onChange?: (event: Event, newValue: number | number[]) => void
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

const EditRatioSlider: React.FC<Props> = ({ min = 0, max = 200, value, assetData, mintAmount, onChange }) => {
	const valueLabelFormat = (value: number) => {
		return `${value}%`
	}

	return (
		<Box>
			<Box width="100%">
				<StyledSlider
					value={value}
					min={min}
					step={10}
					max={max}
					valueLabelFormat={valueLabelFormat}
					onChange={onChange}
					valueLabelDisplay="on"
				/>
			</Box>
      <Stack direction="row" gap={2}>
        <StyledBox>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box display="flex">
                <Image src={'/images/assets/USDi.png'} width="28px" height="28px" />
                <Box sx={{ width: '80px', marginLeft: '8px', textAlign: 'left' }}>
                  USDi
                </Box>
              </Box>
              <InputAmount id="ip-amount" type="number" value={mintAmount} onChange={onChange} />
            </Stack>
          </Box>
          <BottomBox>Current: 30,000.00 USDi</BottomBox>
        </StyledBox>
        <StyledBox sx={{ borderRadius: '10px', border: 'solid 1px #0038ff' }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box display="flex">
                <Image src={assetData.tickerIcon} width="28px" height="28px" />
                <Box sx={{ width: '80px', marginLeft: '8px', textAlign: 'left' }}>
                  {assetData.tickerSymbol}
                </Box>
              </Box>
              <Box>{assetData.price}</Box>
            </Stack>
          </Box>
          <BottomBox>Current: 120.00 iSOL</BottomBox>
        </StyledBox>
      </Stack>
		</Box>
	)
}

const StyledBox = styled(Box)`
  border-radius: 10px;
  border: solid 1px #0038ff;
`

const BottomBox = styled(Box)`
  height: 21px;
  font-size: 11px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #949494;
`

const InputAmount = styled(`input`)`
	width: 130px;
	margin-left: 10px;
	text-align: right;
	border: 0px;
	background-color: #333333;
	font-size: 16px;
	font-weight: 500;
	color: #fff;
`

export default EditRatioSlider
