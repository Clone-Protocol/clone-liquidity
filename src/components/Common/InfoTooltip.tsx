import React from 'react'
import { styled } from '@mui/material/styles';
import { IconButton } from '@mui/material'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { HelpOutlineRounded } from '@mui/icons-material'

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#a9a9a9',
    color: '#000',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

const InfoTooltip = ({ title, color = 'inherit' }: {title: string, color?: string}) => (
  <LightTooltip title={title} placement="top" arrow>
    <IconButton sx={{ color: color }}>
      <HelpOutlineRounded sx={{ width: '13px', height: '13px' }} />
    </IconButton>
  </LightTooltip>
)

export default InfoTooltip;