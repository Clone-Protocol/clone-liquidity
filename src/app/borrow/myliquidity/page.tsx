'use client'
import { StyledSection } from '../../page'
import { Container } from '@mui/material'
import BorrowPositions from '~/containers/Liquidity/borrow/BorrowPositions'

const Borrow = () => {
  return (
    <StyledSection>
      <Container>
        <BorrowPositions />
      </Container>
    </StyledSection>
  )
}

export default Borrow
