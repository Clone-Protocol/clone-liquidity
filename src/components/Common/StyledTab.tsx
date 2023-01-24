import { styled } from '@mui/system'
import { Tabs, Tab, Box } from '@mui/material'
import { MouseEventHandler, ReactElement } from 'react'

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
	onMouseEnter?: MouseEventHandler
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
	paddingTop: '6px'
})

export const StyledTab = styled((props: StyledTabProps) => <Tab disableRipple iconPosition="start" {...props} />)(({ theme }) => ({
	'&.MuiTab-root': {
		height: '35px',
		minHeight: '0px',
		maxHeight: '35px',
		display: 'flex',
		gap: '10px',
		'&:hover': {
			color: '#fff',
		}
	},
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
		borderStyle: 'solid',
		borderImage: 'linear-gradient(83deg, #8925ed 1%, #7d4fff 25%, #ab96ff 37%, #fff 48%, #ab96ff 60%, #7d4fff 72%, #8925ed 95%)',
		borderWidth: '1px',
		borderImageSlice: 1,
	}
})

export const SinglepoolTab = styled((props: StyledTabProps) => (
	<StyledTab {...props} />
))({
	'&.Mui-selected': {
		borderStyle: 'solid',
		borderImage: 'linear-gradient(81deg, #258ded 0%, #4fe5ff 24%, #96efff 36%, #fff 48%, #96efff 60%, #4fe5ff 72%, #258ded 96%)',
		borderWidth: '1px',
		borderImageSlice: 1,
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
				<Box>
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