import { styled, Box, Paper, Stack, Tabs, Tab } from '@mui/material'
import { useState } from 'react'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { Status } from '~/web3/MyLiquidity/status'

interface Props {
	status: Status
}

const StatusView: React.FC<Props> = ({ status }) => {
  const [tab, setTab] = useState(0)

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
		setTab(newValue)
	}

	return status ? (
		<StyledPaper variant="outlined">
      <StyledTabs value={tab} onChange={handleChangeTab}>
        <StyledTab value={0} label="All" />
        <StyledTab value={1} label="Comet" />
        <StyledTab value={2} label="Unconcentrated" />
        <StyledTab value={3} label="Borrow" />
      </StyledTabs>

      <TabPanel value={tab} index={0}>
        <Box>
          <Title>Total Value</Title>
          <BalanceValue>
            <NumValue>{status.totalVal.toLocaleString()}</NumValue> USDi
          </BalanceValue>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Box>
          <Title>Comet</Title>
          <BalanceValue>
            <NumValue>{status.comet.toLocaleString()}</NumValue> USDi
          </BalanceValue>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Box>
          <Title>Unconcentrated</Title>
          <BalanceValue>
            <NumValue>{status.unconcentrated.toLocaleString()}</NumValue> USDi
          </BalanceValue>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <Box>
          <Title>Borrow</Title>
          <BalanceValue>
            <NumValue>{status.borrow.toLocaleString()}</NumValue> USDi
          </BalanceValue>
        </Box>
      </TabPanel>
		</StyledPaper>
	) : (
		<></>
	)
}

export default withCsrOnly(StatusView)

const StyledPaper = styled(Paper)`
	font-size: 14px;
	font-weight: 500;
	background: linear-gradient(to bottom, rgba(21, 22, 24, 0.75) 100%, #002888 -159%);
	color: #fff;
	padding: 10px 18px;
	border-radius: 10px;
	height: 168px;
`
const Title = styled('div')`
	font-size: 14px;
	font-weight: 500;
	color: #989898;
	margin-bottom: 10px;
`

const BalanceValue = styled('div')`
	font-size: 14px;
	font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
`

const NumValue = styled('span')`
	font-size: 24px;
`

interface TabPanelProps {
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

const StyledTabs = styled((props: StyledTabsProps) => (
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

const StyledTab = styled((props: StyledTabProps) => <Tab disableRipple iconPosition="start" {...props} />)(({ theme }) => ({
  '&.MuiTab-root': {
    height: '35px',
    minHeight: '0px',
    maxHeight: '35px',
    display: 'flex',
    gap: '10px'
  },
  textTransform: 'none',
	fontWeight: '600',
	fontSize: '12px',
  marginLeft: '6px',
  marginRight: '6px',
	color: '#989898',
	'&.Mui-selected': {
    border: 'solid 1px #3f3f3f',
    backgroundColor: '#000',
		color: '#fff',
    borderRadius: '10px'
	},
	'&.Mui-focusVisible': {
		backgroundColor: '#3d3d3d',
	},
}))

const TabPanel = (props: TabPanelProps) => {
	const { children, value, index, ...other } = props

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}>
			{value === index && (
				<Box sx={{ px: 3, py: 2 }}>
					<div>{children}</div>
				</Box>
			)}
		</div>
	)
}
