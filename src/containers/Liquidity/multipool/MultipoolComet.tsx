import { Box, Stack, Grid } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import InfoBookIcon from 'public/images/info-book-icon.png'

const MultipoolComet = () => {


  return (
    <Wrapper>
      Multipool
      <Stack
        sx={{
          background: 'rgba(128, 156, 255, 0.09)',
          border: '1px solid #809cff',
          borderRadius: '10px',
          color: '#809cff',
          padding: '8px',
          marginBottom: '26px',
        }}
        direction="row">
        <Box sx={{ width: '73px', textAlign: 'center', marginTop: '6px' }}>
          <Image src={InfoBookIcon} />
        </Box>
        <WarningBox>
          Multipool comet is an advanced feature that requires thorough understanding of the mechanism. Please besure to read and learn about it before first engaging with it.
        </WarningBox>
      </Stack>

      <Grid container spacing={2}>
			  <Grid item xs={12} md={2}>

        </Grid>
        <Grid item xs={12} md={5}>

        </Grid>
        <Grid item xs={12} md={5}>

        </Grid>
      </Grid>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  margin-top: 26px;
`

const WarningBox = styled(Box)`
	padding-right: 10px;
	font-size: 11px;
	font-weight: 500;
	color: #989898;
`

export default MultipoolComet
