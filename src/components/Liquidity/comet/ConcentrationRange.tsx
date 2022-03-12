import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import React, { useState } from 'react'
import Slider, { SliderThumb } from '@mui/material/Slider';

const RangeSlider = styled(Slider)(({ theme }) => ({
  color: '#0038ff',
  height: 3,
  padding: '13px 0',
  '& .MuiSlider-thumb': {
    height: 27,
    width: 27,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
    },
    '& .airbnb-bar': {
      height: 9,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1,
    },
  },
  '& .MuiSlider-track': {
    height: 3,
    border: 0,
    background: 'linear-gradient(to right, #00f0ff -1%, #0038ff 109%)'
  },
  '& .MuiSlider-rail': {
    color: theme.palette.mode === 'dark' ? '#bfbfbf' : '#333333',
    opacity: theme.palette.mode === 'dark' ? undefined : 1,
    height: 3,
  },
}));

interface ThumbComponentProps extends React.HTMLAttributes<unknown> {}

function ThumbComponent(props: ThumbComponentProps) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />      
    </SliderThumb>
  );
}

const BACKGROUND_VALID_RANGE_COLOR = 'linear-gradient(to right, #00f0ff -1%, #0038ff 109%)'
const BACKGROUND_WARNING_RANGE_COLOR = '#e9d100'

const ConcentrationRange: React.FC = () => {
  const center_price = 100
  const min_distance = 30
  const minLimit = 0
  const maxLimit = 200

  const [value, setValue] = useState<number[]>([20, 180])
  const [trackCss, setTrackCss] = useState({
    background: BACKGROUND_VALID_RANGE_COLOR
  })

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
      const leftValFromCenter = Math.abs(center_price - newValue[0])
      const rightVal = maxLimit - newValue[0]
      if (newValue[1] - newValue[0] < min_distance) {
          // const clamped = Math.min(newValue[0], 100 - minDistance);
          // setValue([clamped, clamped + minDistance]);
                
        // setValue(newValue as number[]);
        setValue([newValue[0], rightVal])
        setTrackCss({
          background: BACKGROUND_WARNING_RANGE_COLOR
        })
      } else {
        setValue([newValue[0], rightVal])
        setTrackCss({
          background: BACKGROUND_VALID_RANGE_COLOR
        })
      }
    }
  };

  return (
    <RangeSlider
      sx={{
        '& .MuiSlider-track': trackCss
      }}
      min={minLimit}
      max={maxLimit}
      components={{ Thumb: ThumbComponent }}
      onChange={handleChange}
      defaultValue={[20, 40]}
      disableSwap
      valueLabelDisplay="auto"
      value={value}
    />
  )
}

export default withCsrOnly(ConcentrationRange)