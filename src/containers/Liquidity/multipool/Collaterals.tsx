import { Box, Button } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import CollateralPairView from '~/components/Liquidity/multipool/CollateralPairView'
import EditCollateralDialog from './Dialogs/EditCollateralDialog'
import ChooseCollateralDialog from './Dialogs/ChooseCollateralDialog'
import { Collateral } from '~/features/MyLiquidity/multipool/MultipoolInfo.query'

const Collaterals = ({ collaterals } : {collaterals: Collateral[]}) => {
  const [openEditCollateral, setOpenEditCollateral] = useState(false)
  const [openChooseCollateral, setOpenChooseCollateral] = useState(false)
  const [chooseEditType, setChooseEditType] = useState(0)

  const openEdit = (tab: number) => {
    setOpenEditCollateral(true)
    setChooseEditType(tab)
  }

  const handleChooseCollateral = (collId: number) => {
    console.log('collId', collId)

    setOpenChooseCollateral(false)
  }

  return (
    <>
      <Box>
        {collaterals.map((coll) => 
          <CollateralPairView
            tickerIcon={coll.tickerIcon}
            tickerSymbol={coll.tickerSymbol}
            value={coll.collAmount}
            usdValue={coll.collAmountDollarPrice}
            handleOpenEdit={openEdit}
          />
        )}
      </Box>
      <AddButton onClick={() => openEdit(0)}>Add Collateral</AddButton>

      <EditCollateralDialog
        open={openEditCollateral}
        isDeposit={chooseEditType===0}
        handleChooseColl={() => setOpenChooseCollateral(true)}
        handleClose={() => setOpenEditCollateral(false)}
      />

      <ChooseCollateralDialog
        open={openChooseCollateral}
        handleChooseCollateral={handleChooseCollateral}
        handleClose={() => setOpenChooseCollateral(false)}
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