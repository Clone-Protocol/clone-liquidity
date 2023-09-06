import { Box, Button, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import { GridColDef, GridEventListener, GridRenderCellParams } from '@mui/x-data-grid'
import { Grid, CellTicker, CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { Collateral } from '~/features/MyLiquidity/comet/CometInfo.query'
import MultipoolBlank from '~/components/Overview/CometBlank'
import dynamic from 'next/dynamic'
import { useSetAtom } from 'jotai'
import { mintUSDi } from '~/features/globalAtom'

const Collaterals = ({ hasNoCollateral, collaterals, onRefetchData }: { hasNoCollateral: boolean, collaterals: Collateral[], onRefetchData: () => void }) => {
  const [openEditCollateral, setOpenEditCollateral] = useState(false)
  const alreadyHasDeposit = collaterals.length > 0 && !hasNoCollateral
  const setMintUsdi = useSetAtom(mintUSDi)
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

  const rowsCollateral = collaterals.map((coll, id) => ({
    ...coll,
    id,
    setMintUsdi
  }))

  const handleRowClick: GridEventListener<'rowClick'> = (
    params
  ) => {
    // if (isAlreadyInitializedAccount) {
    // 	router.push(`/assets/${params.row.ticker}`)
    // } else {
    // 	handleLinkNeedingAccountClick(undefined)
    // }
  }

  return (
    <>
      <Grid
        headers={columns}
        rows={rowsCollateral || []}
        minHeight={120}
        customNoRowsOverlay={() => CustomNoRowsOverlay('Please connect wallet.')}
        onRowClick={handleRowClick}
      />

      {/* {hasNoCollateral ?
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
      } */}

      {/* {alreadyHasDeposit ?
        <AddButton onClick={() => openEdit()} sx={collaterals.length == 0 ? { borderColor: '#258ded', color: '#fff' } : {}}><Typography variant='p_sm'>+ New Collateral Type</Typography></AddButton>
        :
        <AddButtonNoPosition onClick={() => openEdit()} sx={collaterals.length == 0 ? { borderColor: '#258ded', color: '#fff' } : {}}><Typography variant='p_sm'>+ New Collateral Type</Typography></AddButtonNoPosition>
      } */}

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

let columns: GridColDef[] = [
  {
    field: 'collType',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'Collateral Type',
    flex: 2,
    renderCell(params: GridRenderCellParams<string>) {
      return (
        <CellTicker tickerIcon={params.row.tickerIcon} tickerName={params.row.tickerName} tickerSymbol={params.row.tickerSymbol} />
      )
    },
  },
  {
    field: 'depositAmount',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'Deposit Amount',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>${params.row.collAmount.toLocaleString()}</Typography>
    },
  },
  {
    field: 'usdValue',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'Value ($)',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>${(params.row.collAmountDollarPrice * params.row.collAmount).toLocaleString()}</Typography>
    },
  },
  {
    field: 'action',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: '',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return (
        <GetButton onClick={() => params.row.setMintUsdi(true)}><Typography variant='p'>Get devUSD</Typography></GetButton>
      )
    },
  },
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

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
const GetButton = styled(Button)`
  width: 130px;
  height: 30px;
  flex-grow: 0;
  border-radius: 5px;
  color: #fff;
  border: solid 1px ${(props) => props.theme.basis.shadowGloom};
  background: ${(props) => props.theme.basis.jurassicGrey};
  &:hover {
    background: transparent;
    border: solid 1px ${(props) => props.theme.basis.gloomyBlue};
  }
`

export default Collaterals