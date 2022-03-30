import { styled } from '@mui/system'
import { Tabs, Tab, Box } from '@mui/material'

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
})

export const StyledTab = styled((props: StyledTabProps) => <Tab disableRipple {...props} />)(({ theme }) => ({
  height: '53px',
  textTransform: 'none',
	fontWeight: '500',
	fontSize: '18px',
  background: '#171717',
	color: '#989898',
	'&.Mui-selected': {
    background: '#3d3d3d',
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
				<Box sx={{ p: 3 }}>
					<div>{children}</div>
				</Box>
			)}
		</div>
	)
}