import { Box, Button, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import CollateralPairView from '~/components/Liquidity/multipool/CollateralPairView'
import EditCollateralDialog from './Dialogs/EditCollateralDialog'
import ChooseCollateralDialog from './Dialogs/ChooseCollateralDialog'
import { Collateral } from '~/features/MyLiquidity/multipool/MultipoolInfo.query'
import MultipoolBlank from '~/components/Overview/MultipoolBlank'

const Collaterals = ({ hasNoCollateral, collaterals, onRefetchData }: { hasNoCollateral: boolean, collaterals: Collateral[], onRefetchData: () => void }) => {
  const [openEditCollateral, setOpenEditCollateral] = useState(false)
  const [openChooseCollateral, setOpenChooseCollateral] = useState(false)
  const [chooseEditType, setChooseEditType] = useState(0)

  const openEdit = (tab: number) => {
    setOpenEditCollateral(true)
    setChooseEditType(tab)
  }

  const handleChooseCollateral = (collId: number) => {
    setOpenChooseCollateral(false)
  }

  const BlankNoCollateral = () => (
    <MultipoolBlank title='Deposit collaterals to multipool to get started' subtitle='Multipool Liquidity Positions are designed to enable advanced users to 
    fully leverage the CLS' />
  )

  return (
    <>
      {hasNoCollateral ?
        <BlankNoCollateral />
        :
        <Box>
          {collaterals.map((coll, id) =>
            <CollateralPairView
              key={id}
              tickerIcon={coll.tickerIcon}
              tickerSymbol={coll.tickerSymbol}
              value={coll.collAmount}
              usdValue={coll.collAmountDollarPrice * coll.collAmount}
              handleOpenEdit={openEdit}
            />
          )}
        </Box>
      }

      {collaterals.length > 0 && !hasNoCollateral ?
        <AddButton onClick={() => openEdit(0)} sx={collaterals.length == 0 ? { borderColor: '#258ded', color: '#fff' } : {}}><Typography variant='p_sm'>+ New Collateral Type</Typography></AddButton>
        :
        <AddButtonNoPosition onClick={() => openEdit(0)} sx={collaterals.length == 0 ? { borderColor: '#258ded', color: '#fff' } : {}}><Typography variant='p_sm'>+ New Collateral Type</Typography></AddButtonNoPosition>
      }

      <EditCollateralDialog
        open={openEditCollateral}
        isDeposit={chooseEditType === 0}
        onRefetchData={onRefetchData}
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
  width: 100%;
  height: 28px;
  padding: 4px 0;
  border: solid 1px ${(props) => props.theme.boxes.greyShade};
  color: ${(props) => props.theme.palette.text.secondary};
  margin-top: 9px;
  &:hover {
    background: ${(props) => props.theme.boxes.darkBlack};
    color: #fff;
    border-color: ${(props) => props.theme.palette.text.secondary};
  }
`
const AddButtonNoPosition = styled(AddButton)`
  border-color: ${(props) => props.theme.palette.info.main};
  color: #fff;
  &:hover {
    border-color: ${(props) => props.theme.palette.info.main};
  }
`

export default Collaterals