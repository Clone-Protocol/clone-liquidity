'use client'
import { StyledSection } from '~/app/page'
import { Container, Box } from '@mui/material'
import LiquidityTable from '~/containers/Liquidity/LiquidityTable'

// const MyLiquidity = ({ params }: { params: { lTab: string } }) => {
const MyLiquidity = () => {

  return (
    <StyledSection>
      <Container>
        <Box marginTop='40px'>
          {/* <LiquidityTable ltab={params.lTab} /> */}
          <LiquidityTable ltab={'0'} />
        </Box>
      </Container>
    </StyledSection>
  )
}

export default MyLiquidity
