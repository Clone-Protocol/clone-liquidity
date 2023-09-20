'use client'
import { StyledSection } from '~/app/page'
import { Container, Box } from '@mui/material'
import ManageBorrow from '~/containers/Liquidity/borrow/ManageBorrow'

const Manage = ({ params }: { params: { assetId: string } }) => {
  return (
    <StyledSection>
      <Container>
        <Box marginTop='40px' marginLeft='24px'>
          <ManageBorrow assetId={params.assetId} />
        </Box>
      </Container>
    </StyledSection>
  )
}

export default Manage
