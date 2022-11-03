import { Box, Slider, styled } from '@mui/material'
import { relative } from 'path'

interface Props {
	min?: number
	value: number
  hideValueBox?: boolean
	showChangeRatio?: boolean
	onChange?: (event: Event, newValue: number | number[]) => void
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
    zIndex: 10,
		color: '#444444',
		height: 3,
	},
}))

const RatioSlider: React.FC<Props> = ({ min = 0, value, hideValueBox = false, showChangeRatio = false, onChange }) => {
	const max = min + 100 + 50
	const normValue = (value !== max) ? 180 - (value % 150) : 30

	const valueLabelFormat = (val: number) => {
		if (value > max) {
			return `${val.toFixed(0)}%+`
		} else if (value < min)  {
			return `<${val.toFixed(0)}%`
		} else {
			return `${val.toFixed(0)}%`
		}
	}

	return (
		<Box
			sx={{
				display: 'flex',
			}}>
			{!hideValueBox ? <ValueBox>{valueLabelFormat(value)}</ValueBox> : <></>}
			{showChangeRatio &&
				<Box display='flex'>
					<InputAmount id="ip-amount" type="number" min={0} placeholder="0.00" value={Number(value).toString()} onChange={(event: any) => onChange && onChange(event, parseFloat(event.currentTarget.value))} />
					<div style={{ marginLeft: '-24px', marginRight: '10px', marginTop: '16px' }}>%</div>
				</Box>
			}
			<Box width="100%">
				<StyledSlider
					sx={{
						'& .MuiSlider-track': {
              // background: `linear-gradient(to right, #f00 -22%, #809cff ${normValue}%)`
							background: `linear-gradient(to right, #f00 -160px, #809cff 270px)`
            }
					}}
					value={value > min ? value : min}
					min={min - 25}
					step={5}
					max={min + 100 + 50}
					valueLabelFormat={valueLabelFormat}
					onChange={onChange}
					valueLabelDisplay={'on'}
				/>
        <Box sx={{ display: 'flex', }}>
          <Box sx={{ marginLeft: '30px' }}><Stick /><FlagBox>min {min}%</FlagBox></Box>
          <Box sx={{ marginLeft: '163px' }}><Stick /><FlagBox>safe {min + 100}%</FlagBox></Box>
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

const InputAmount = styled(`input`)`
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
	cursor: pointer;
	&:hover {
    border: solid 1px #809cff;
  }
`

const FlagBox = styled(Box)`
  width: 90px;
  height: 23px;
  padding: 8px;
  border-radius: 10px;
  border: solid 1px #444;
  background-color: #000;
  font-size: 11px;
  font-weight: 500;
  line-height: 3px;
	text-align: center;
  margin-top: 0px;
  // &::after {
  //   position: absolute;
  //   width: 100px;
  //   height: 16px;
  //   top: 10px;
  //   left: 30px;
  //   background: #fff;
  // }
`

const Stick = styled('div')`
  z-index: 20;
	border-radius: 0;
	background: #444;
	width: 1px;
	height: 16px;
	margin-top: -22px;
	margin-left: 34px;
`

export default RatioSlider
