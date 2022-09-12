import React from 'react'
import { Tooltip, IconButton } from '@mui/material'
import { HelpOutlineRounded } from '@mui/icons-material'

const InfoTooltip = ({ title }: { title: string }) => (
  <Tooltip title={title}>
    <IconButton>
      <HelpOutlineRounded />
    </IconButton>
  </Tooltip>
)

export default InfoTooltip;