import { styled } from '@mui/system'
import { Tabs, Tab, Box } from '@mui/material'
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
  backgroundColor: 'rgba(21, 22, 24, 0.75)',
  maxWidth: '620px',
  borderRadius: '10px',
  height: '47px',
  paddingLeft: '8px',
  paddingTop: '6px'
})

export const StyledTab = styled((props: StyledTabProps) => <Tab disableRipple iconPosition="start" {...props} />)(({ theme }) => ({
  '&.MuiTab-root': {
    height: '35px',
    minHeight: '0px',
    maxHeight: '35px',
    display: 'flex',
    gap: '10px',
    borderRadius: '10px',
		backgroundColor: 'rgba(21, 22, 24, 0.75)',
    '&:hover': {
      backgroundColor: 'rgba(38, 38, 38, 0.5)',
      borderRadius: '10px'
    }
  },
  textTransform: 'none',
	fontWeight: '600',
	fontSize: '12px',
  marginLeft: '12px',
  marginRight: '12px',
  backgroundColor: 'rgba(21, 22, 24, 0.75)',
	color: '#989898',
	'&.Mui-selected': {
    border: 'solid 1px rgba(128, 156, 255, 0.62)',
    backgroundColor: '#000',
		color: '#fff',
    borderRadius: '10px'
	},
	'&.Mui-focusVisible': {
		backgroundColor: '#3d3d3d',
	},
}))

export const TabPanel = (props: TabPanelProps) => {
	const { children, value, index, ...other } = props

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}>
			{value === index && (
				<Box sx={{ pl: 3, pr: 3 }}>
					<div>{children}</div>
				</Box>
			)}
		</div>
	)
}

export const TabPanelForEdit = (props: TabPanelProps) => {
	const { children, value, index, ...other } = props

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}>
			{value === index && (
				<Box>
					<div>{children}</div>
				</Box>
			)}
		</div>
	)
}