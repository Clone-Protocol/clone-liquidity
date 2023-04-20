import { useState } from 'react'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { Box, Stack, Popover, Typography } from '@mui/material'
import { formatDollarAmount } from '~/utils/numbers'
import { HealthScoreType } from '~/containers/Liquidity/comet/GridComet'

interface Props {
  iPrice: number
  centerPrice: number
  lowerLimit: number
  upperLimit: number
  scoreTypeColor?: string
}

const MiniPriceRange: React.FC<Props> = ({ iPrice, centerPrice, lowerLimit, upperLimit, scoreTypeColor = HealthScoreType.Normal }) => {
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
            <LeftRangeStick sx={{ background: scoreTypeColor }} />
            <RangeBar sx={{ background: scoreTypeColor }} />
            <RightRangeStick sx={{ background: scoreTypeColor }} />
          </Box>

          <CenterStick sx={{ marginLeft: '50%' }} />
          {/* <Stick sx={{ marginLeft: `calc(${centerPricePercent}%)` }} /> */}
        </Box>
        <RightBox>{formatDollarAmount(upperLimit, 2, true).slice(1)}</RightBox>
      </Box>

      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: 'none',
          marginTop: '-60px',
          '& .MuiPopover-paper': {
            backgroundColor: '#3f3f3f'
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
            <Typography variant='p_sm'>iAsset Price:</Typography>
            <Typography variant='p_sm'>${iPrice.toLocaleString(undefined, { maximumFractionDigits: 3 })} USDi</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ marginTop: '5px' }}>
            <Typography variant='p_sm'>Center Price:</Typography>
            <Typography variant='p_sm'>${centerPrice.toLocaleString(undefined, { maximumFractionDigits: 3 })} USDi</Typography>
          </Stack>
        </HoverBox>
      </Popover>
    </Box>
  )
}

const LeftRangeStick = styled('div')`
  position: relative;
  border-radius: 0;
  background: #fff;
  width: 1px;
  height: 9px;
  margin-top: -12px;
  z-index: 20;
`

const RightRangeStick = styled('div')`
  position: relative;
  border-radius: 0;
  background: #fff;
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
	height: 5px;
	margin-top: -7px;
  z-index: 20;
`
// const Stick = styled('div')`
//   position: relative;
// 	border-radius: 0;
// 	background: #fff;
// 	width: 2px;
// 	height: 3px;
// 	margin-top: 0px;
//   z-index: 20;
// `
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
  background: #fff;
`

const HoverBox = styled(Box)`
  width: 192px;
  height: 45px;
  padding: 6px 17px;
  background-color: ${(props) => props.theme.boxes.greyShade};
  color: #fff;
`

export default withCsrOnly(MiniPriceRange)
