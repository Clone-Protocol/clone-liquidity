import { Tab, Tabs, TabsProps, SxProps } from '@mui/material'
import { styled } from '@mui/system'
import React from 'react'

export const PageTabs: React.FC<Pick<TabsProps, 'value' | 'onChange' | 'sx' | 'variant' | 'scrollButtons'>> = ({
	children,
	sx,
	...props
}) => (
	<StyledTabs
		TabIndicatorProps={{ style: { height: '3px', backgroundColor: '#232323' } }}
		sx={sx as SxProps}
		{...props}>
		{children}
	</StyledTabs>
)

export const StyledTabs = styled(Tabs)`
`
export const PageTab = styled(Tab)`
  font-size: 12px;
  font-weight: 600;
  text-transform: none;
	&.MuiTab-root {
		padding: 3px 9px 4px 8px;
		height: 21px;
		margin-right: 10px;
    border-radius: 4px;
    border: solid 1px #535353;
    color: #989898;
    text-transform: none;
	}
	&.Mui-selected {
		font-weight: bold;
		color: #fff;
    border: solid 1px #fff;
	}
  &.Mui-focusVisible {
    background-color: #fff;
    color: #fff;
  }
	.highlight {
		color: #fff;
	}
`