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
	label: string | ReactElement
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
		'&:hover': {
			color: '#fff',
		}
	},
	textTransform: 'none',
	fontWeight: '500',
	fontSize: '12px',
	marginLeft: '12px',
	marginRight: '12px',
	color: '#989898',
	'&.Mui-selected': {
		border: 'solid 1px #fff',
		color: '#fff',
	},
}))

export const MultipoolTab = styled((props: StyledTabProps) => (
	<StyledTab {...props} />
))({
	'&.Mui-selected': {
		border: '1px solid transparent',
		backgroundImage: 'linear-gradient(83deg, #8925ed 1%, #7d4fff 25%, #ab96ff 37%, var(--white) 48%, #ab96ff 60%, #7d4fff 72%, #8925ed 95%)',
		borderImageSlice: 1,
		backgroundOrigin: 'border-box',
		backgroundClip: 'content-box, border-box'
	}
})

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