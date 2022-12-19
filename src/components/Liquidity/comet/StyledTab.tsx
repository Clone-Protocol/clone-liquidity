import { styled } from '@mui/system'
import { Tabs, Tab } from '@mui/material'

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
  icon?: any
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
  borderRadius: '10px',
  height: '29px',
})

export const StyledTab = styled((props: StyledTabProps) => <Tab disableRipple iconPosition="start" {...props} />)(({ theme }) => ({
  '&.MuiTab-root': {
    height: '29px',
    minHeight: '0px',
    maxHeight: '29px',
    display: 'flex',
    gap: '5px'
  },
  textTransform: 'none',
	fontWeight: '600',
	fontSize: '11px',
  marginLeft: '5px',
  marginRight: '5px',
	color: '#989898',
	'&.Mui-selected': {
		boxShadow: `0 0 0 1px #3f3f3f inset`,
    backgroundColor: '#000',
		color: '#fff',
    borderRadius: '10px'
	},
	'&.Mui-focusVisible': {
		backgroundColor: '#3d3d3d',
	},
}))
