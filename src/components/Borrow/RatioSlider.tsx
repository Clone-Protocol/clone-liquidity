import { Box, Slider, styled } from '@mui/material'

interface Props {
	min?: number
	max?: number
	value: number
  hideValueBox?: boolean
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
    background: 'linear-gradient(to right, #f00 -12%, #809cff 66%)'
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

const RatioSlider: React.FC<Props> = ({ min = 0, max = 200, value, hideValueBox = false, onChange }) => {
	const valueLabelFormat = (value: number) => {
		return `${value}%`
	}

	return (
		<Box
			sx={{
				display: 'flex',
			}}>
			{!hideValueBox ? <ValueBox>{valueLabelFormat(value)}</ValueBox> : <></>}
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
        <Box sx={{ display: 'flex', }}>
          <FlagBox sx={{ marginLeft: '27px' }}>min 150%</FlagBox>
          <FlagBox sx={{ marginLeft: '172px' }}>safe 200%</FlagBox>
        </Box>
			</Box>
		</Box>
	)
}

const ValueBox = styled(Box)`
	text-align: center;
	background-color: #333;
  border: solid 1px #444;
	border-radius: 10px;
	width: 102px;
	height: 54px;
	line-height: 28px;
	font-size: 16px;
	font-weight: 500;
	color: #fff;
	padding: 12px 18px 12px 26px;
`

const FlagBox = styled(Box)`
  width: 69px;
  height: 23px;
  padding: 6px 4px 7px 9px;
  border-radius: 10px;
  border: solid 1px #444;
  background-color: #000;
  font-size: 11px;
  font-weight: 500;
  line-height: 9px;
  margin-top: -8px;
  // &::after {
  //   position: absolute;
  //   width: 100px;
  //   height: 16px;
  //   top: 10px;
  //   left: 30px;
  //   background: #fff;
  // }
`

export default RatioSlider
