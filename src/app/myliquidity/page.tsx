'use client'
import { StyledSection } from '~/app/page'
import { Container, Box } from '@mui/material'
import LiquidityTable from '~/containers/Liquidity/LiquidityTable'
import { useSearchParams } from 'next/navigation'

const MyLiquidity = () => {
  const searchParams = useSearchParams()
  const lTab = searchParams.get('ltab') || '0'

  return (
    <StyledSection>
      <Container>
        <Box marginTop='40px'>
          <LiquidityTable ltab={lTab} />
        </Box>
      </Container>
    </StyledSection>
  )
}

export default MyLiquidity
