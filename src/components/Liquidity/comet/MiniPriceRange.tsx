import { useState } from 'react'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { Box, Stack, Popover } from '@mui/material'
import { formatDollarAmount } from '~/utils/numbers'

interface Props {
  iPrice: number
  centerPrice: number
  lowerLimit: number
  upperLimit: number
}

const MiniPriceRange: React.FC<Props> = ({ iPrice, centerPrice, lowerLimit, upperLimit }) => {
  const centerPricePercent = (centerPrice - lowerLimit) * 100 / (upperLimit - lowerLimit)

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}>
        <LeftBox>{formatDollarAmount(lowerLimit, 2, true).slice(1)}</LeftBox>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
            <LeftRangeStick />
            <RangeBar />
            <RightRangeStick />
          </Box>

          <CenterStick sx={{ marginLeft: '50%' }} />
          <Stick sx={{ marginLeft: `calc(${centerPricePercent}%)` }} />
        </Box>
        <RightBox>{formatDollarAmount(upperLimit, 2, true).slice(1)}</RightBox>
      </Box>

      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: 'none',
          marginTop: '-60px',
          '& .MuiPopover-paper': {
            borderRadius: '10px',
            border: 'solid 1px #616161',
            backgroundColor: 'rgba(52, 52, 52, 0.9)'
          }
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <HoverBox>
          <Stack direction="row" justifyContent="space-between">
            <div>Indicator Price:</div>
            <div>$ {iPrice.toLocaleString(undefined, { maximumFractionDigits: 3 })}</div>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ marginTop: '5px' }}>
            <div>Center Price:</div>
            <div>$ {centerPrice.toLocaleString(undefined, { maximumFractionDigits: 3 })}</div>
          </Stack>
        </HoverBox>
      </Popover>
    </Box>
  )
}

const LeftRangeStick = styled('div')`
  position: relative;
  border-radius: 0;
  background: #809cff;
  width: 1px;
  height: 9px;
  margin-top: -12px;
  z-index: 20;
`

const RightRangeStick = styled('div')`
  position: relative;
  border-radius: 0;
  background: #809cff;
  width: 1px;
  height: 9px;
  margin-top: -12px;
  z-index: 20;
`

const CenterStick = styled('div')`
  position: relative;
	border-radius: 0;
	background: #fff;
	width: 2px;
	height: 6px;
	margin-top: -6px;
  z-index: 20;
`

const Stick = styled('div')`
  position: relative;
	border-radius: 0;
	background: #fff;
	width: 2px;
	height: 15px;
	margin-top: -9px;
  z-index: 20;
`

const LeftBox = styled(Box)`
  width: 15px;
  height: 28px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 6px;
  text-align: center;
  margin-right: -10px;
`

const RightBox = styled(Box)`
  width: 15px;
  height: 28px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 6px;
  text-align: center;
  margin-left: -10px;
`

const RangeBar = styled('div')`
  width: 68px;
  height: 2px;  
  background: #809cff;
`

const HoverBox = styled(Box)`
  width: 152px;
  height: 54px;
  padding: 9px 11px 8px 12px;
  background-color: rgba(52, 52, 52, 0.9);
  font-size: 9px;
  font-weight: 500;
  color: #fff;
`

export default withCsrOnly(MiniPriceRange)
