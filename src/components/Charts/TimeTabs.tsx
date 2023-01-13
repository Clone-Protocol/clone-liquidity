import { Tab, Tabs, TabsProps, SxProps } from '@mui/material'
import { styled } from '@mui/system'
import React from 'react'

export enum FilterTimeMap {
	'24h' = '24h',
	'7d' = '7d',
	'30d' = '30d',
	'1y' = '1y',
}
export type FilterTime = keyof typeof FilterTimeMap

export const TimeTabs: React.FC<Pick<TabsProps, 'value' | 'onChange' | 'sx' | 'variant' | 'scrollButtons'>> = ({
	children,
	sx,
	...props
}) => (
	<Tabs TabIndicatorProps={{ style: { height: '0px', backgroundColor: '#fff' } }} sx={sx as SxProps} {...props}>
		{children}
	</Tabs>
)

export const TimeTab = styled(Tab)`
	font-size: 10px;
	font-weight: 500;
	&.MuiTab-root {
		padding: 0px;
    min-width: 35px;
		height: 15px;
		min-height: 15px;
	}
	&.Mui-selected {
		color: #fff;
		text-decoration: underline;
	}
`
