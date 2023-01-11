import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import Slider, { SliderThumb } from '@mui/material/Slider'
import { PositionInfo, CometInfo } from '~/features/MyLiquidity/CometPosition.query'

const BACKGROUND_VALID_RANGE_COLOR = 'linear-gradient(to right, #809cff -1%, #0038ff 109%)'
const BACKGROUND_WARNING_RANGE_COLOR = '#e9d100'

const LEFT_SLIDER_THUMB_COLOR = '#809cff'
const RIGHT_SLIDER_THUMB_COLOR = '#0038ff'

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
	height: 3,
	padding: '13px 0',
	//leftThumb
	'& .MuiSlider-thumb[data-index="0"]': {
		height: 30,
		width: 75,
    backgroundColor: '#171717',
		marginTop: '-46px',
		marginLeft: '-37px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    borderBottomRightRadius: '0px',
    borderBottomLeftRadius: '8px',
		'&::after': {
			width: '1px',
			height: '33px',
			position: 'absolute',
      borderRadius: '0px',
      borderTopRightRadius: '8px',
      borderBottomLeftRadius: '8px',
			left: '74px',
			top: '45px',
		},
		'&:hover': {
			boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
		},
    '& .left-thumb-cursor': {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: LEFT_SLIDER_THUMB_COLOR,
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px',
      width: '14px',
      height: '28px',
      marginLeft: '-64px'
    },
		'& .slider-bar': {
			height: 16,
			width: 1,
			backgroundColor: '#000',
			marginLeft: 1,
			marginRight: 1,
		},
		'& .MuiSlider-valueLabel': {
			fontSize: '11px',
			fontWeight: '500',
			top: 25,
			left: 16,
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
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    borderBottomRightRadius: '8px',
    borderBottomLeftRadius: '0px',
		marginTop: '-47px',
		marginLeft: '37px',
		'&::after': {
			width: '1px',
			height: '33px',
			position: 'absolute',
			left: '-1px',
			top: '45px',
      borderRadius: '0px',
      borderTopLeftRadius: '8px',
      borderBottomRightRadius: '8px',
		},
		'& .MuiSlider-valueLabel': {
			fontSize: '11px',
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
		background: 'linear-gradient(to right, #00f0ff -1%, #0038ff 109%)',
	},
	'& .MuiSlider-rail': {
		color: theme.palette.mode === 'dark' ? '#bfbfbf' : '#333333',
		opacity: theme.palette.mode === 'dark' ? undefined : 1,
		height: 3,
	},
}))

interface ThumbComponentProps extends React.HTMLAttributes<unknown> {}

function ThumbComponent(props: ThumbComponentProps) {
	const { children, ...other } = props
	return (
		<SliderThumb {...other}>
			{children}
      <Box className="left-thumb-cursor">
			  <span className="slider-bar" />
			  <span className="slider-bar" />
      </Box>
		</SliderThumb>
	)
}

// function ValueLabelComponent(props: { children: React.ReactElement; value: number }) {
// 	const { children, value } = props

// 	return (
// 		<Box>
// 			<Tooltip enterTouchDelay={0} placement="top" title={value}>
// 				{children}
// 			</Tooltip>
// 		</Box>
// 	)
// }

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
			border: `solid 1px ${LEFT_SLIDER_THUMB_COLOR}`,
			'&::after': {
				border: `1px solid ${LEFT_SLIDER_THUMB_COLOR}`,
			},
		},
		'& .MuiSlider-thumb[data-index="1"]': {
			border: `solid 1px ${RIGHT_SLIDER_THUMB_COLOR}`,
			'&::after': {
				border: `1px solid ${RIGHT_SLIDER_THUMB_COLOR}`,
			},
		},
	})

	useEffect(() => {
		setValue([parseFloat(cometData.lowerLimit.toFixed(3)), parseFloat(cometData.upperLimit.toFixed(3))])
	}, [cometData.lowerLimit, cometData.upperLimit])

	const handleChange = (event: Event, newValue: number | number[], activeThumb: number) => {
		if (activeThumb == 1) return // rightThumb should be prevented

		if (!Array.isArray(newValue)) {
			return
		}

		if (activeThumb === 0) {
			const rightVal = newValue[1]
			setValue([newValue[0], rightVal])

			// Tight Concentration
			if (newValue[1] - newValue[0] <= assetData.tightRange) {
				setTrackCss({
					'& .MuiSlider-track': {
						background: BACKGROUND_WARNING_RANGE_COLOR,
					},
					'& .MuiSlider-thumb[data-index="0"]': {
						border: `solid 1px ${BACKGROUND_WARNING_RANGE_COLOR}`,
						'&::after': {
							border: `1px solid ${BACKGROUND_WARNING_RANGE_COLOR}`,
						},
					},
					'& .MuiSlider-thumb[data-index="1"]': {
						border: `solid 1px ${BACKGROUND_WARNING_RANGE_COLOR}`,
						'&::after': {
							border: `1px solid ${BACKGROUND_WARNING_RANGE_COLOR}`,
						},
					},
				})

				onChange && onChange(true, newValue[0], newValue[1])
			} else {
				setTrackCss({
					'& .MuiSlider-track': {
						background: BACKGROUND_VALID_RANGE_COLOR,
					},
					'& .MuiSlider-thumb[data-index="0"]': {
						border: `solid 1px ${LEFT_SLIDER_THUMB_COLOR}`,
						'&::after': {
							border: `1px solid ${LEFT_SLIDER_THUMB_COLOR}`,
						},
					},
					'& .MuiSlider-thumb[data-index="1"]': {
						border: `solid 1px ${RIGHT_SLIDER_THUMB_COLOR}`,
						'&::after': {
							border: `1px solid ${RIGHT_SLIDER_THUMB_COLOR}`,
						},
					},
				})
				onChange && onChange(false, newValue[0], newValue[1])
			}
		}
	}

  //@ts-ignore
  const handleChangeCommitted = (event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    if (!Array.isArray(newValue)) {
			return
		}

    onChangeCommitted && onChangeCommitted(newValue[0], newValue[1])
  }

	return (
		<Box sx={{ position: 'relative' }}>
			<RangeSlider
				sx={trackCss}
				min={minLimit}
				max={parseFloat(maxLimit.toFixed(3))}
				step={0.01}
				components={{ Thumb: ThumbComponent }}
				onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
				defaultValue={[defaultLower, defaultUpper]}
				disableSwap
				valueLabelDisplay="on"
				value={value}
			/>
			<CenterPriceBox sx={{ left: `calc(${centerPricePercent}% - 35px)` }}>
				{assetData.price.toFixed(3)}
				<Stick />
			</CenterPriceBox>
		</Box>
	)
}

const CenterPriceBox = styled(Box)`
	position: absolute;
	left: calc(50% - 30px);
	bottom: 81px;
	width: 74px;
	height: 30px;
	border-radius: 10px;
	border: solid 1px #fffdfd;
	text-align: center;
	font-size: 11px;
	font-weight: 500;
	color: #fff;
	line-height: 28px;
`

const Stick = styled('div')`
	border-radius: 0;
	background: #fff;
	width: 1px;
	height: 63px;
	margin-top: 0px;
	margin-left: 34px;
`

export default withCsrOnly(ConcentrationRange)
