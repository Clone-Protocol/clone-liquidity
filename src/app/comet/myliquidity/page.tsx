'use client'
import { StyledSection } from '~/app/page'
import { Container, Box } from '@mui/material'
import CometLiquidity from '~/containers/Liquidity/comet/CometLiquidity'
import { useSearchParams } from 'next/navigation'

const MyLiquidity = () => {
  const searchParams = useSearchParams()
  const lTab = searchParams.get('ltab') || '0'

  return (
    <StyledSection>
      <Container>
        <Box>
          <CometLiquidity ltab={lTab} />
        </Box>
      </Container>
    </StyledSection>
  )
}

export default MyLiquidity
