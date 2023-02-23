import { styled } from '@mui/system'
import { Tabs, Tab } from '@mui/material'
import { ReactElement } from 'react'

export interface TabPanelProps {
	children?: React.ReactNode
	index: number
	value: number
}

interface StyledTabsProps {
	children?: React.ReactNode
	value: number
	onChange: (event: React.SyntheticEvent, newValue: number) => void
}

interface StyledTabProps {
	label: string
	value: number
	icon?: ReactElement
}

export const StyledTabs = styled((props: StyledTabsProps) => (
	<Tabs {...props} TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }} />
))({
	'& .MuiTabs-indicator': {
		display: 'flex',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},
	'& .MuiTabs-indicatorSpan': {
		display: 'none'
	},
	height: '38px',
})

export const StyledTab = styled((props: StyledTabProps) => <Tab disableRipple iconPosition="start" {...props} />)(({ theme }) => ({
	'&.MuiTab-root': {
		height: '38px',
		minHeight: '0px',
		maxHeight: '38px',
	},
	textTransform: 'none',
	fontWeight: '500',
	fontSize: '12px',
	color: '#989898',
	'&.Mui-selected': {
		borderBottom: '1px solid #fff',
		backgroundColor: '#242424',
		color: '#fff',
	},
	'&.Mui-focusVisible': {
		backgroundColor: '#242424',
	},
}))
