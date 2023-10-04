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
	text-transform: none;
	color: #fff;
	&.MuiTab-root {
		padding: 0px;
    min-width: 36px;
		height: 20px;
		min-height: 15px;
		color: ${(props) => props.theme.basis.slug};
		text-transform: none;
	}
	&:hover {
		background-color: ${(props) => props.theme.basis.jurassicGrey};
		color: ${(props) => props.theme.basis.slug};
	}
	&.Mui-selected {
		background-color: ${(props) => props.theme.basis.jurassicGrey};
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
