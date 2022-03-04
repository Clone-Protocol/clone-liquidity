import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { styled } from '@mui/system'
import { Container, Box, Tabs, Tab } from '@mui/material'
import EditPanel from '~/containers/Liquidity/borrow/EditPanel'
import ClosePanel from '~/containers/Liquidity/borrow/ClosePanel'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

const Manage: NextPage = () => {
  const [tab, setTab] = useState(0)
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <div>
      <Head>
        <title>Manage - Incept Liquidity Protocol</title>
        <meta name="description" content="Incept Liquidity Protocol" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <StyledSection>
          <Container>
            <Box sx={{ marginTop: '40px' }}>
              <Tabs 
                value={tab}
                onChange={handleChangeTab}>
                <Tab value={0} label="Edit"></Tab>
                <Tab value={1} label="Close"></Tab>
              </Tabs>
            </Box>
            <TabPanel value={tab} index={0}>
              <EditPanel />
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <ClosePanel />
            </TabPanel>
          </Container>
        </StyledSection>
      </main>
    </div>
  )
}

const StyledSection = styled('section')`
	${(props) => props.theme.breakpoints.up('md')} {
		padding-top: 100px;
	}
	${(props) => props.theme.breakpoints.down('md')} {
		padding: 50px 0px;
	}
`

export default Manage
