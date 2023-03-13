import { Box, Slider, styled, Typography } from '@mui/material'

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
	marginTop: '4px',
	'& .MuiSlider-thumb': {
		height: 16,
		width: 16,
		backgroundColor: '#fff',
		'&:hover': {
			boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
		},
	},
	'& .MuiSlider-track': {
		height: 4,
		border: 'none',
		background: '#4fe5ff'
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
		<Box display='flex' alignItems='center'>
			{!hideValueBox ? <ValueBox><Typography variant='p_xlg'>{valueLabelFormat(value)}</Typography></ValueBox> : <></>}
			<Box width="100%">
				<StyledSlider
					value={value}
					min={min}
					step={10}
					max={max}
					valueLabelFormat={valueLabelFormat}
					onChange={onChange}
					valueLabelDisplay="off"
				/>
			</Box>
		</Box>
	)
}

const ValueBox = styled(Box)`
	text-align: center;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
	width: 62px;
	height: 35px;
	padding-top: 5px;
`

export default RatioSlider
