import { styled, Box, Typography } from '@mui/material'
import { useState } from 'react'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { Status } from '~/features/MyLiquidity/Status.query'
import { StyledTabs, StyledTab } from '../Charts/StyledTab'
import { formatDollarAmount } from '~/utils/numbers'
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
      <Box>
        <StyledTabs value={tab} onChange={handleChangeTab}>
          <StyledTab value={0} label="Total Liquidity"></StyledTab>
          <StyledTab value={1} label="TVL"></StyledTab>
        </StyledTabs>
      </Box>

      <TabPanel value={tab} index={0}>
        <BalanceValue>
          <Typography variant='p_xxxlg'>{formatDollarAmount(status.totalVal, 0, true)}</Typography>
        </BalanceValue>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <BalanceValue>
          <Typography variant='p_xxxlg'>{formatDollarAmount(status.totalVal, 0, true)}</Typography>
        </BalanceValue>
      </TabPanel>
    </StyledPaper>
  ) : (
    <></>
  )
}

export default withCsrOnly(StatusView)

const StyledPaper = styled(Box)`
	color: #fff;
	padding-y: 18px;
	height: 138px;
`
const BalanceValue = styled('div')`
  animation: fadeInUp;
  animation-duration: 1s;
`

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

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
