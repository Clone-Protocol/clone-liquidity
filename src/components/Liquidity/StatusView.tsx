import { styled, Box, Tabs, Tab } from '@mui/material'
import { useState } from 'react'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { Status } from '~/features/MyLiquidity/Status.query'
import 'animate.css';

interface Props {
	status: Status
}

const StatusView: React.FC<Props> = ({ status }) => {
  const [tab, setTab] = useState(0)

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
		setTab(newValue)
	}

	return status ? (
		<StyledPaper>
      <StyledTabs value={tab} onChange={handleChangeTab}>
        <StyledTab value={0} label="All" />
        <StyledTab value={1} label="Comet" />
        <StyledTab value={2} label="Unconcentrated" />
        <StyledTab value={3} label="Borrow" />
        <StyledTab value={4} label="Multipool Comet" />
        <StyledTab value={5} label="Liquidated" />
      </StyledTabs>

      <TabPanel value={tab} index={0}>
        <Box>
          <Title>Total Value</Title>
          <BalanceValue>
            <NumValue>{status.totalVal.toLocaleString()}</NumValue> USD
          </BalanceValue>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Box>
          <Title>Comet</Title>
          <BalanceValue>
            <NumValue>{status.comet.toLocaleString()}</NumValue> USD
          </BalanceValue>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Box>
          <Title>Unconcentrated</Title>
          <BalanceValue>
            <NumValue>{status.unconcentrated.toLocaleString()}</NumValue> USD
          </BalanceValue>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <Box>
          <Title>Borrow</Title>
          <BalanceValue>
            <NumValue>{status.borrow.toLocaleString()}</NumValue> USD
          </BalanceValue>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={4}>
        <Box>
          <Title>Multipool Comet</Title>
          <BalanceValue>
            <NumValue>{status.multipoolComet.toLocaleString()}</NumValue> USD
          </BalanceValue>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={5}>
        <Box>
          <Title>Liquidated</Title>
          <BalanceValue>
            <NumValue>{status.liquidated.toLocaleString()}</NumValue> USD
          </BalanceValue>
        </Box>
      </TabPanel>
		</StyledPaper>
	) : (
		<></>
	)
}

export default withCsrOnly(StatusView)

const StyledPaper = styled(Box)`
	font-size: 14px;
	font-weight: 500;
	background-image: linear-gradient(rgba(21, 22, 24, 0.75), rgba(0, 40, 136, 0.5));
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
  animation: fadeInUp;
  animation-duration: 1s;
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
  value: number
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
  maxWidth: '812px',
  borderRadius: '10px',
  height: '34px',
  paddingLeft: '8px',
  paddingTop: '6px'
})

const StyledTab = styled((props: StyledTabProps) => <Tab disableRipple iconPosition="start" {...props} />)(({ theme }) => ({
  '&.MuiTab-root': {
    height: '29px',
    minHeight: '0px',
    maxHeight: '35px',
    display: 'flex',
    gap: '10px',
    '&:hover': {
      backgroundColor: 'rgba(38, 38, 38, 0.5)',
      borderRadius: '10px'
    }
  },
  textTransform: 'none',
	fontWeight: '600',
	fontSize: '11px',
  marginLeft: '6px',
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
