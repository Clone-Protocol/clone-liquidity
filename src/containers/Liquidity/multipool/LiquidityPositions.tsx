import { Box, Stack, Grid, Button } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useState } from 'react'
import RecenterDialog from './Dialogs/RecenterDialog'
import AddPositionDialog from './Dialogs/AddPositionDialog'

const LiquidityPositions = () => {

  const [openAddPosition, setOpenAddPosition] = useState(false)
  const [openRecenter, setOpenRecenter] = useState(false)

  return (
    <>
      <Box>
        
      </Box>
      <Stack direction='row' justifyContent='space-between'>
        <AddButton onClick={() => setOpenAddPosition(true)}>Add Position</AddButton>
        <RecenterAllButton onClick={() => setOpenRecenter(true)}>Recenter all</RecenterAllButton>
      </Stack>

      <AddPositionDialog
        open={openAddPosition}
        handleClose={() => setOpenAddPosition(false)}
      />
      <RecenterDialog
        assetId='0'
        open={openRecenter}
        handleClose={() => setOpenRecenter(false)}
      />
    </>
  )

}

const AddButton = styled(Button)`
  background: #1d1d1d;
  height: 26px;
  padding: 4px 0;
  border-radius: 10px;
  border: solid 1px #535353;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
`

const RecenterAllButton = styled(Button)`
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  height: 26px;
  padding: 4px 0;
  border-radius: 10px;
  border-style: solid;
  border-width: 1px;
  border-image-source: linear-gradient(to bottom, #8c73ac 0%, #7d17ff 100%);
  border-image-slice: 1;
  background-image: linear-gradient(to bottom, #000, #000), linear-gradient(to bottom, #8c73ac 0%, #7d17ff 100%);
  background-origin: border-box;
  background-clip: content-box, border-box;
`

export default LiquidityPositions