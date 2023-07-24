'use client'
import { styled } from '@mui/system'
import { Container, Box } from '@mui/material'
import WelcomeMsg from '~/components/Overview/WelcomeMsg'
import LineChart from '~/containers/Overview/LineChart'
import AssetList from '~/containers/Overview/AssetList'

const Overview = () => {
  return (
    <div>
      <StyledSection>
        <Container>
          <WelcomeMsg />
          <Box marginTop='40px'>
            <Box marginBottom='19px'>
              <LineChart />
            </Box>
            <AssetList />
          </Box>
        </Container>
      </StyledSection>
    </div>
  )
}

export const StyledSection = styled('section')`
	${(props) => props.theme.breakpoints.up('md')} {
		padding-top: 100px;
	}
	${(props) => props.theme.breakpoints.down('md')} {
		padding: 50px 0px;
	}
`

export default Overview
