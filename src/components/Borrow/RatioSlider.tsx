import { Box, Slider, styled, Typography } from '@mui/material'

interface Props {
	min?: number
	value: number
	hideValueBox?: boolean
	showChangeRatio?: boolean
	onChange?: (event: React.ChangeEvent<HTMLInputElement>, newValue: number | number[]) => void
}

const StyledSlider = styled(Slider)(({ theme }) => ({
	color: '#FFF',
	height: 4,
	padding: '13px 0',
	marginTop: '13px',
	'& .MuiSlider-thumb': {
		zIndex: 30,
		height: 16,
		width: 16,
		backgroundColor: '#fff',
		'&:hover': {
			boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
		},
	},
	'& .MuiSlider-track': {
		zIndex: 10,
		height: 4,
		border: 'none',
	},
	'& .MuiSlider-valueLabel': {
		width: '65px',
		fontSize: '12px',
		fontWeight: '500',
		border: '1px solid #fff',
		padding: '4px 8px 4px 8px',
		backgroundColor: '#000',
		'&:before': { display: 'none' },
	},
	'& .MuiSlider-rail': {
		zIndex: 10,
		color: '#3f3f3f',
		height: 4,
	},
}))

const RatioSlider: React.FC<Props> = ({ min = 0, value, hideValueBox = false, showChangeRatio = false, onChange }) => {
	const max = min + 100 + 50

	const valueLabelFormat = (val: number) => {
		if (value > max) {
			return `${val.toFixed(0)}%+`
		} else if (value < min) {
			return `<${val.toFixed(0)}%`
		} else {
			return `${val.toFixed(0)}%`
		}
	}

	return (
		<Box display='flex'>
			{!hideValueBox ? <ValueBox><Typography variant='p_xlg'>{valueLabelFormat(value)}</Typography></ValueBox> : <></>}
			{showChangeRatio &&
				<Box display='flex'>
					<InputAmount id="ip-amount" type="number" min={0} placeholder="0.00" value={Number(value).toString()} onChange={(event) => onChange && onChange(event, parseFloat(event.currentTarget.value))} />
					<div style={{ marginLeft: '-26px', marginRight: '12px', marginTop: '14px' }}><Typography variant='p_xlg'>%</Typography></div>
				</Box>
			}
			<Box width="100%">
				<StyledSlider
					sx={{
						'& .MuiSlider-track': {
							background: `linear-gradient(to right, #ff8e4f 90px, #ffffff 550px)`
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
				<Box display='flex'>
					<Box marginLeft='30px'><Stick /><FlagBox>min {min}%</FlagBox></Box>
					<Box marginLeft='165px'><Stick /><FlagBox>safe {min + 100}%</FlagBox></Box>
				</Box>
			</Box>
		</Box>
	)
}

const ValueBox = styled(Box)`
	text-align: center;
	background-color: ${(props) => props.theme.boxes.black};
	width: 108px;
	height: 48px;
	line-height: 28px;
	color: #fff;
	padding: 12px 18px 12px 26px;
`

const InputAmount = styled(`input`)`
	text-align: center;
	background-color: ${(props) => props.theme.boxes.black};
	width: 108px;
	height: 48px;
	border: solid 1px ${(props) => props.theme.boxes.greyShade};
	line-height: 15px;
	color: #fff;
	font-size: 17.3px;
	font-weight: 500;
	padding: 12px 18px;
	cursor: pointer;
	&:hover {
    border: solid 1px #809cff;
  }
`

const FlagBox = styled(Box)`
  width: 90px;
  height: 23px;
  padding: 8px;
  font-size: 11px;
  font-weight: 500;
  line-height: 3px;
  margin-top: 0px;
`

const Stick = styled('div')`
  z-index: 20;
	border-radius: 0;
	background: #fff;
	width: 1px;
	height: 13px;
	margin-top: -22px;
	margin-left: 34px;
`

export default RatioSlider
