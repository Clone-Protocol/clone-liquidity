'use client'
import { StyledSection } from '../../index'
import Container from '@mui/material/Container'
import AssetView from '~/containers/Overview/AssetView'
import { Box } from '@mui/material'
import { AssetTickers, DEFAULT_ASSET_ID } from '~/data/assets'
import { useRouter } from 'next/router'

const AssetPage = () => {
  const router = useRouter()
  const assetTicker = router.query.assetTicker || DEFAULT_ASSET_ID

  return (
    <StyledSection>
      <Container>
        <Box display='flex' justifyContent='center'>
          {/* <AssetView assetTicker={assetTicker} /> */}
        </Box>
      </Container>
    </StyledSection>
  )
}

export default AssetPage
