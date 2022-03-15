import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import React, { useState, useEffect } from 'react'
import { Tooltip, Box } from '@mui/material';
import Slider, { SliderThumb } from '@mui/material/Slider';
import { AssetData } from '~/features/Overview/Asset.query';

const BACKGROUND_VALID_RANGE_COLOR = 'linear-gradient(to right, #00f0ff -1%, #0038ff 109%)'
const BACKGROUND_WARNING_RANGE_COLOR = '#e9d100'

const LEFT_SLIDER_THUMB_COLOR = '#00f0ff'
const RIGHT_SLIDER_THUMB_COLOR = '#0038ff'

interface Props {
  assetData: AssetData,
  onChange?: (isTight: boolean, lowerLimit: number, upperLimit: number) => void
  max: number,
  defaultLower: number,
  defaultUpper: number
}

const RangeSlider = styled(Slider)(({ theme }) => ({
  color: '#0038ff',
  height: 3,
  padding: '13px 0',
  //leftThumb
  '& .MuiSlider-thumb[data-index="0"]': {
    height: 27,
    width: 27,
    backgroundColor: LEFT_SLIDER_THUMB_COLOR,
    border: `solid 2px ${LEFT_SLIDER_THUMB_COLOR}`,
    marginTop: '-46px',
    marginLeft: '-12px',
    '&::after': {
      border: `1px solid ${LEFT_SLIDER_THUMB_COLOR}`,
      borderRadius: 0,
      background: '#fff',
      width: '1px',
      height: '50px',
      position: 'absolute',
      left: '24px',
      top: '35px'
    },
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
    },
    '& .slider-bar': {
      height: 9,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1,
    },
    '& .MuiSlider-valueLabel': {
      fontSize: '15px',
      fontWeight: '500',
      top: 28,
      left: 24,
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
    height: 31,
    width: 88,
    backgroundColor: '#171717',
    border: `solid 2px ${RIGHT_SLIDER_THUMB_COLOR}`,
    borderRadius: '8px',
    marginTop: '-44px',
    marginLeft: '43px',
    '&::after': {
      border: `1px solid ${RIGHT_SLIDER_THUMB_COLOR}`,
      borderRadius: 0,
      background: '#fff',
      width: '1px',
      height: '50px',
      position: 'absolute',
      left: '-1px',
      top: '35px'
    },
    '& .MuiSlider-valueLabel': {
      fontSize: '15px',
      fontWeight: '500',
      top: 28,
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
  '& .MuiSlider-track': {
    height: 6,
    border: 0,
    background: 'linear-gradient(to right, #00f0ff -1%, #0038ff 109%)'
  },
  '& .MuiSlider-rail': {
    color: theme.palette.mode === 'dark' ? '#bfbfbf' : '#333333',
    opacity: theme.palette.mode === 'dark' ? undefined : 1,
    height: 6,
  },
}));

interface ThumbComponentProps extends React.HTMLAttributes<unknown> {}

function ThumbComponent(props: ThumbComponentProps) {
  const { children, ...other } = props;
  // console.log('other',other)
  return (
    <SliderThumb {...other}>
      {children}
      <span className="slider-bar" />
      <span className="slider-bar" />
    </SliderThumb>
  );
}

function ValueLabelComponent(props: {
  children: React.ReactElement;
  value: number;
}) {
  const { children, value } = props;

  return (
    <Box>
      <Tooltip enterTouchDelay={0} placement="top" title={value}>
        {children}
      </Tooltip>
    </Box>
  );
}

const ConcentrationRange: React.FC<Props> = ({ assetData, onChange, max, defaultLower, defaultUpper }) => {
  const [centerPrice, setCenterPrice] = useState(assetData.centerPrice)
  const minLimit = 0
  const maxLimit = max
  const centerPricePercent = assetData.centerPrice * 100 / maxLimit

  // const [value, setValue] = useState<number[]>([20, 180])
  const [value, setValue] = useState<number[]>([assetData.lowerLimit, assetData.upperLimit])
  const [trackCss, setTrackCss] = useState({
    '& .MuiSlider-track': {
      background: BACKGROUND_VALID_RANGE_COLOR
    },
    '& .MuiSlider-thumb[data-index="0"]': {
      backgroundColor: LEFT_SLIDER_THUMB_COLOR,
      border: `solid 2px ${LEFT_SLIDER_THUMB_COLOR}`,
      '&::after': {
        border: `1px solid ${LEFT_SLIDER_THUMB_COLOR}`
      }
    },
    '& .MuiSlider-thumb[data-index="1"]': {
      border: `solid 2px ${RIGHT_SLIDER_THUMB_COLOR}`,
      '&::after': {
        border: `1px solid ${RIGHT_SLIDER_THUMB_COLOR}`,
      }
    }
  })

  useEffect(() => {
    if (assetData.lowerLimit && assetData.upperLimit) {
      setValue([parseFloat(assetData.lowerLimit.toFixed(2)), parseFloat(assetData.upperLimit.toFixed(2))])
    }
  }, [assetData.lowerLimit, assetData.upperLimit])

  const handleChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (activeThumb == 1) return; // rightThumb should be prevented

    if (!Array.isArray(newValue)) {
      return;
    }
  
    if (activeThumb === 0) {
      // const leftValFromCenter = Math.abs(centerPrice - newValue[0])
      // const rightVal = maxLimit - newValue[0]
      const rightVal = newValue[1]
      setValue([newValue[0], rightVal])

      // Tight Concentration
      if (newValue[1] - newValue[0] <= assetData.tightRange) {
          // const clamped = Math.min(newValue[0], 100 - minDistance);
          // setValue([clamped, clamped + minDistance]);
        // setValue(newValue as number[]);
        
        setTrackCss({
          '& .MuiSlider-track': {
            background: BACKGROUND_WARNING_RANGE_COLOR
          },
          '& .MuiSlider-thumb[data-index="0"]': {
            backgroundColor: BACKGROUND_WARNING_RANGE_COLOR,
            border: `solid 2px ${BACKGROUND_WARNING_RANGE_COLOR}`,
            '&::after': {
              border: `1px solid ${BACKGROUND_WARNING_RANGE_COLOR}`
            }
          },
          '& .MuiSlider-thumb[data-index="1"]': {
            border: `solid 2px ${BACKGROUND_WARNING_RANGE_COLOR}`,
            '&::after': {
              border: `1px solid ${BACKGROUND_WARNING_RANGE_COLOR}`,
            }
          }
        })

        onChange && onChange(true, newValue[0], newValue[1])
      } else {
        setTrackCss({
          '& .MuiSlider-track': {
            background: BACKGROUND_VALID_RANGE_COLOR
          },
          '& .MuiSlider-thumb[data-index="0"]': {
            backgroundColor: LEFT_SLIDER_THUMB_COLOR,
            border: `solid 2px ${LEFT_SLIDER_THUMB_COLOR}`,
            '&::after': {
              border: `1px solid ${LEFT_SLIDER_THUMB_COLOR}`
            }
          },
          '& .MuiSlider-thumb[data-index="1"]': {
            border: `solid 2px ${RIGHT_SLIDER_THUMB_COLOR}`,
            '&::after': {
              border: `1px solid ${RIGHT_SLIDER_THUMB_COLOR}`,
            }
          }
        })
        onChange && onChange(false, newValue[0], newValue[1])
      }

    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <RangeSlider
        sx={trackCss}
        min={minLimit}
        max={maxLimit}
        step={0.01}
        components={{ Thumb: ThumbComponent }}
        onChange={handleChange}
        defaultValue={[defaultLower, defaultUpper]}
        disableSwap
        valueLabelDisplay="on"
        value={value}
      />
      <CenterPriceBox sx={{ left: `calc(${centerPricePercent}% - 43px)` }}>
        {centerPrice}
        <Stick />
      </CenterPriceBox>
    </Box>
  )
}

const CenterPriceBox = styled(Box)`
  position: absolute;
  left: calc(50% - 43px);
  bottom: 80px;
  width: 87px;
  height: 36px;
  border-radius: 10px;
  border: solid 2px #fffdfd;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  line-height: 28px;
`

const Stick = styled('div')`
  border: 1px solid #fff;
  border-radius: 0;
  background: #fff;
  width: 1px;
  height: 64px;
  margin-top: 5px;
  margin-left: 41px;
`

export default withCsrOnly(ConcentrationRange)