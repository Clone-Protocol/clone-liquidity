import { Box, Button, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import CollateralPairView from '~/components/Liquidity/comet/CollateralPairView'
import { Collateral } from '~/features/MyLiquidity/comet/CometInfo.query'
import MultipoolBlank from '~/components/Overview/CometBlank'
import dynamic from 'next/dynamic'

const Collaterals = ({ hasNoCollateral, collaterals, onRefetchData }: { hasNoCollateral: boolean, collaterals: Collateral[], onRefetchData: () => void }) => {
  const [openEditCollateral, setOpenEditCollateral] = useState(false)
  const alreadyHasDeposit = collaterals.length > 0 && !hasNoCollateral
  // const [openChooseCollateral, setOpenChooseCollateral] = useState(false)
  const EditCollateralDialog = dynamic(() => import('./Dialogs/EditCollateralDialog'))
  // const ChooseCollateralDialog = dynamic(() => import('./Dialogs/ChooseCollateralDialog'))

  const openEdit = () => {
    setOpenEditCollateral(true)
  }

  // const handleChooseCollateral = (collId: number) => {
  //   setOpenChooseCollateral(false)
  // }

  const BlankNoCollateral = () => (
    <MultipoolBlank title='Deposit collateral to your comet to get started' subtitle='Comets are designed to allow users to leverage the full capabilities of the CLS' />
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

      {alreadyHasDeposit ?
        <AddButton onClick={() => openEdit()} sx={collaterals.length == 0 ? { borderColor: '#258ded', color: '#fff' } : {}}><Typography variant='p_sm'>+ New Collateral Type</Typography></AddButton>
        :
        <AddButtonNoPosition onClick={() => openEdit()} sx={collaterals.length == 0 ? { borderColor: '#258ded', color: '#fff' } : {}}><Typography variant='p_sm'>+ New Collateral Type</Typography></AddButtonNoPosition>
      }

      <EditCollateralDialog
        open={openEditCollateral}
        isNewDeposit={!alreadyHasDeposit}
        onRefetchData={onRefetchData}
        // handleChooseColl={() => setOpenChooseCollateral(true)}
        handleClose={() => setOpenEditCollateral(false)}
      />

      {/* <ChooseCollateralDialog
        open={openChooseCollateral}
        handleChooseCollateral={handleChooseCollateral}
        handleClose={() => setOpenChooseCollateral(false)}
      /> */}
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