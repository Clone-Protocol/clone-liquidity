'use client'
import { StyledSection } from '~/app/page'
import Container from '@mui/material/Container'
import AssetView from '~/containers/Overview/AssetView'
import { Box } from '@mui/material'
import { AssetTickers } from '~/data/assets'

const AssetPage = ({ params }: { params: { assetTicker: string } }) => {
  const assetTicker = params.assetTicker || AssetTickers.euro

  return (
    <StyledSection>
      <Container>
        <Box display='flex' justifyContent='center' mt="15px">
          <AssetView assetTicker={assetTicker} />
        </Box>
      </Container>
    </StyledSection>
  )
}

export default AssetPage
