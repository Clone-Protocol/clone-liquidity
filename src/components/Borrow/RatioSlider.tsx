import { Box, Slider, styled } from '@mui/material'

interface Props {
  min?: number,
  max?: number,
  value: number,
  onChange?: (event: Event, newValue: number | number[]) => void
}

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: '#FFF',
  height: 3,
  padding: '13px 0',
  marginTop: '5px',
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
  },
  '& .MuiSlider-rail': {
    color: theme.palette.mode === 'dark' ? '#bfbfbf' : '#333',
    opacity: theme.palette.mode === 'dark' ? undefined : 1,
    height: 3,
  },
}));

const RatioSlider: React.FC<Props> = ({ min=0, max=200, value, onChange }) => {
  
  const valueLabelFormat = (value: number) => {
    return `${value} %`
  }

  return (
    <Box sx={{
      display: 'flex',
    }}>
      <ValueBox>{valueLabelFormat(value)}</ValueBox>
      <Box width="100%">
        <StyledSlider
          value={value}
          min={min}
          step={10}
          max={max}
          valueLabelFormat={valueLabelFormat}
          onChange={onChange}
          valueLabelDisplay="auto"
        />
      </Box>
    </Box>
  )
}

const ValueBox = styled(Box)`
  text-align: center;
  background-color: #333;
  border-radius: 10px;
  width: 111px;
  height: 45px;
  line-height: 23px;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  padding: 12px 18px 12px 26px;
`

export default RatioSlider
