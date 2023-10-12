'use client'
import { StyledSection } from '~/app/page'
import { Container, Box } from '@mui/material'
import ManageBorrow from '~/containers/Liquidity/borrow/ManageBorrow'

const Manage = ({ params }: { params: { assetId: string } }) => {
  return (
    <StyledSection>
      <Container>
        <ManageBorrow assetId={params.assetId} />
      </Container>
    </StyledSection>
  )
}

export default Manage
