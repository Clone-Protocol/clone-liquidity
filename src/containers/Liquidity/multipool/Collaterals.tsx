import { Box, Button } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import AddCollateralDialog from './Dialogs/AddCollateralDialog'
import CollateralPairView from '~/components/Liquidity/multipool/CollateralPairView'
import EditCollateralDialog from './Dialogs/EditCollateralDialog'

const Collaterals = () => {
  const [openAddCollateral, setOpenAddCollateral] = useState(false)
  const [openEditCollateral, setOpenEditCollateral] = useState(false)

  const openEdit = (tab: number) => {
    console.log('t', tab)
    setOpenEditCollateral(true)
  }

  return (
    <>
      <Box>
        <CollateralPairView
          tickerIcon={'/images/assets/solana.png'}
          tickerSymbol="SOL"
          value={1005.04}
          usdValue={10000}
          handleOpenEdit={openEdit}
        />
      </Box>
      <AddButton onClick={() => setOpenAddCollateral(true)}>Add Collateral</AddButton>

      <AddCollateralDialog
        open={openAddCollateral}
        handleClose={() => setOpenAddCollateral(false)}
      />
      <EditCollateralDialog
        open={openEditCollateral}
        handleClose={() => setOpenEditCollateral(false)}
      />
    </>
  )

}

const AddButton = styled(Button)`
  background: #1d1d1d;
  width: 112px;
  height: 26px;
  padding: 4px 0;
  border-radius: 10px;
  border: solid 1px #535353;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  margin-top: 9px;
`

export default Collaterals