import { Tab, Tabs, TabsProps, SxProps } from '@mui/material'
import { styled } from '@mui/system'
import React from 'react'

export const PageTabs: React.FC<Pick<TabsProps, 'value' | 'onChange' | 'sx' | 'variant' | 'scrollButtons'>> = ({
	children,
	sx,
	...props
}) => (
	<StyledTabs TabIndicatorProps={{ style: { height: '0px', backgroundColor: '#fff' } }} sx={sx as SxProps} {...props}>
		{children}
	</StyledTabs>
)

export const StyledTabs = styled(Tabs)`
	height: 36px;
  background-color: #282828;
  border-radius: 10px;
  padding-left: 10px;
  padding-top: 4px;
	min-height: 28px;
`
export const PageTab = styled(Tab)`
	font-size: 11px;
	font-weight: 600;
	text-transform: none;
	height: 28px;
	color: #fff;
	&.MuiTab-root {
		padding: 0px;
		height: 28px;
		min-height: 28px;
		margin-right: 10px;
		border-radius: 10px;
		color: #989898;
		text-transform: none;
    &:hover {
      background-color: rgba(100, 100, 100, 0.5);
    }
	}
	&.Mui-selected {
    border: solid 1px #3f3f3f;
    background-color: #000;
		color: #fff;
	}
	&.Mui-focusVisible {
		background-color: #fff;
		color: #fff;
	}
	.highlight {
		color: #fff;
	}
`
