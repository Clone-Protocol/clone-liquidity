'use client'
import { StyledSection } from '~/app/page'
import { Container, Box } from '@mui/material'
import CometLiquidity from '~/containers/Liquidity/comet/CometLiquidity'

const MyLiquidity = () => {
  return (
    <StyledSection>
      <Container>
        <Box>
          <CometLiquidity />
        </Box>
      </Container>
    </StyledSection>
  )
}

export default MyLiquidity
