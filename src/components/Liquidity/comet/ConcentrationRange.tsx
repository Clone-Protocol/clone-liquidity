import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import React, { useState } from 'react'
import { Tooltip, Box } from '@mui/material';
import Slider, { SliderThumb } from '@mui/material/Slider';

const BACKGROUND_VALID_RANGE_COLOR = 'linear-gradient(to right, #00f0ff -1%, #0038ff 109%)'
const BACKGROUND_WARNING_RANGE_COLOR = '#e9d100'

const LEFT_SLIDER_THUMB_COLOR = '#00f0ff'
const RIGHT_SLIDER_THUMB_COLOR = '#0038ff'

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
      fontSize: 12,
      fontWeight: 'normal',
      top: 24,
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
    height: 27,
    width: 27,
    backgroundColor: RIGHT_SLIDER_THUMB_COLOR,
    border: `solid 2px ${RIGHT_SLIDER_THUMB_COLOR}`,
    marginTop: '-46px',
    marginLeft: '11px',
    '&::after': {
      border: `1px solid ${RIGHT_SLIDER_THUMB_COLOR}`,
      borderRadius: 0,
      background: '#fff',
      width: '1px',
      height: '50px',
      position: 'absolute',
      left: '0px',
      top: '35px'
    },
    '& .MuiSlider-valueLabel': {
      fontSize: 12,
      fontWeight: 'normal',
      top: 24,
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
  console.log('other',other)
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
      123
    </Box>
  );
}

const ConcentrationRange: React.FC = () => {
  const center_price = 100.00
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
    <Box sx={{ position: 'relative' }}>
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
        valueLabelDisplay="on"
        value={value}
      />
      <CenterPriceBox>
        {center_price}
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