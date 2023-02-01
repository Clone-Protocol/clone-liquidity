import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import Slider, { SliderThumb } from '@mui/material/Slider'
import { PositionInfo, CometInfo } from '~/features/MyLiquidity/CometPosition.query'

const BACKGROUND_VALID_RANGE_COLOR = 'linear-gradient(to right, #fff 21%, #4fe5ff 96%)'
const BACKGROUND_WARNING_RANGE_COLOR = '#e9d100'

const LEFT_SLIDER_THUMB_COLOR = '#fff'
const RIGHT_SLIDER_THUMB_COLOR = '#4fe5ff'

interface Props {
	assetData: PositionInfo
	cometData: CometInfo
	onChange?: (isTight: boolean, lowerLimit: number, upperLimit: number) => void
	onChangeCommitted?: (lowerLimit: number, upperLimit: number) => void
	max: number
	defaultLower: number
	defaultUpper: number
}

const RangeSlider = styled(Slider)(({ theme }) => ({
	color: '#0038ff',
	height: 1,
	padding: '13px 0',
	//leftThumb
	'& .MuiSlider-thumb[data-index="0"]': {
		height: 30,
		width: 75,
		backgroundColor: '#171717',
		marginTop: '-20px',
		marginLeft: '-10px',
		'&::after': {
			width: '3px',
			height: '7px',
			position: 'absolute',
			borderRadius: '0px',
			borderTopRightRadius: '8px',
			borderBottomLeftRadius: '8px',
			left: '49px',
			top: '33px',
		},
		'&:hover': {
			boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
		},
		'& .slider-bar': {
			height: 16,
			width: 1,
			backgroundColor: '#000',
			marginLeft: 1,
			marginRight: 1,
		},
		'& .MuiSlider-valueLabel': {
			fontSize: '12px',
			fontWeight: '500',
			top: 25,
			left: 9,
			backgroundColor: 'unset',
			color: '#fff',
			'&:before': {
				display: 'none',
			},
			'& *': {
				background: 'transparent',
				color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
			},
		},
	},
	//rightThumb
	'& .MuiSlider-thumb[data-index="1"]': {
		height: 30,
		width: 75,
		backgroundColor: '#171717',
		marginTop: '-20px',
		'&::after': {
			width: '3px',
			height: '7px',
			position: 'absolute',
			left: '36px',
			top: '33px',
			borderRadius: '0px',
			borderTopLeftRadius: '8px',
			borderBottomRightRadius: '8px',
		},
		'& .MuiSlider-valueLabel': {
			fontSize: '12px',
			fontWeight: '500',
			top: 26,
			left: 12,
			backgroundColor: 'unset',
			color: '#fff',
			'&:before': {
				display: 'none',
			},
			'& *': {
				background: 'transparent',
				color: theme.palette.mode === 'dark' ? '#fff' : '#fff',
			},
		},
	},
	'& .MuiSlider-track': {
		height: 3,
		border: 0,
		background: 'linear-gradient(to right, #fff 21%, #4fe5ff 96%)',
	},
	'& .MuiSlider-rail': {
		color: theme.palette.mode === 'dark' ? '#bfbfbf' : '#333333',
		opacity: theme.palette.mode === 'dark' ? undefined : 1,
		height: 3,
	},
}))

interface ThumbComponentProps extends React.HTMLAttributes<unknown> { }

function ThumbComponent(props: ThumbComponentProps) {
	const { children, ...other } = props
	return (
		<SliderThumb {...other}>
			{children}
		</SliderThumb>
	)
}

const ConcentrationRange: React.FC<Props> = ({ assetData, cometData, onChange, onChangeCommitted, max, defaultLower, defaultUpper }) => {
	const minLimit = 0
	const maxLimit = max

	const centerPricePercent = (assetData.price * 100) / maxLimit

	const [value, setValue] = useState<number[]>([cometData.lowerLimit, cometData.upperLimit])
	const [trackCss, setTrackCss] = useState({
		'& .MuiSlider-track': {
			background: BACKGROUND_VALID_RANGE_COLOR,
		},
		'& .MuiSlider-thumb[data-index="0"]': {
			'&::after': {
				borderLeft: `1px solid ${LEFT_SLIDER_THUMB_COLOR}`,
			},
		},
		'& .MuiSlider-thumb[data-index="1"]': {
			'&::after': {
				borderRight: `1px solid ${RIGHT_SLIDER_THUMB_COLOR}`,
			},
		},
	})

	useEffect(() => {
		setValue([parseFloat(cometData.lowerLimit.toFixed(3)), parseFloat(cometData.upperLimit.toFixed(3))])
	}, [cometData.lowerLimit, cometData.upperLimit])

	return (
		<Box sx={{ position: 'relative' }} width='404px' margin='0 auto'>
			<RangeSlider
				sx={trackCss}
				min={minLimit}
				max={parseFloat(maxLimit.toFixed(3))}
				step={0.01}
				components={{ Thumb: ThumbComponent }}
				defaultValue={[defaultLower, defaultUpper]}
				disableSwap
				valueLabelDisplay="on"
				value={value}
			/>
			<CenterPriceBox sx={{ left: `calc(${centerPricePercent}% - 35px)` }}>
				<Typography variant='p'>{assetData.price.toFixed(3)}</Typography>
				<Stick />
			</CenterPriceBox>
		</Box>
	)
}

const CenterPriceBox = styled(Box)`
	position: absolute;
	left: calc(50% - 30px);
	bottom: 40px;
	width: 74px;
	height: 20px;
	text-align: center;
`

const Stick = styled('div')`
	border-radius: 0;
	background: #fff;
	width: 3px;
	height: 19px;
	margin-top: 0px;
	margin-left: 34px;
`

export default withCsrOnly(ConcentrationRange)
