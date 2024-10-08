'use client'
import { StyledSection } from '~/app/page'
import Container from '@mui/material/Container'
import AssetView from '~/containers/Overview/AssetView'
import { Box } from '@mui/material'
import { AssetTickers } from '~/data/assets'

const AssetPage = ({ params }: { params: { assetTicker: string } }) => {
  const assetTicker = params.assetTicker || AssetTickers.gold

  return (
    <StyledSection>
      <Container>
        <Box display='flex' justifyContent='center'>
          <AssetView assetTicker={assetTicker} />
        </Box>
      </Container>
    </StyledSection>
  )
}

export default AssetPage
