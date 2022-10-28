import { Box, Stack, Grid, Button } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { useState } from 'react'
import AddCollateralDialog from './Dialogs/AddCollateralDialog'

const Collaterals = () => {
  const [openAddCollateral, setOpenAddCollateral] = useState(false)

  return (
    <>
      <Box>
        {/* <PairInputView
          tickerIcon={'/images/assets/USDi.png'}
          tickerName="USDi Coin"
          tickerSymbol="USDi"
          value={parseFloat(field.value.toFixed(3))}
          headerTitle="Max amount mintable"
          headerValue={maxMintable}
        /> */}
      </Box>
      <AddButton onClick={() => setOpenAddCollateral(true)}>Add Collateral</AddButton>

      <AddCollateralDialog
        open={openAddCollateral}
        handleClose={() => setOpenAddCollateral(false)}
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

export default Collaterals