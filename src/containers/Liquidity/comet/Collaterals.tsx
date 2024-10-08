import { Button, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useCallback, useState } from 'react'
import { GridColDef, GridEventListener, GridRenderCellParams } from '@mui/x-data-grid'
import { Grid, CellTicker, CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { Collateral } from '~/features/MyLiquidity/comet/CometInfo.query'
import dynamic from 'next/dynamic'
import { useSetAtom } from 'jotai'
import { mintUSDi } from '~/features/globalAtom'
import { Collateral as StableCollateral, collateralMapping } from '~/data/assets'
import { useWallet } from '@solana/wallet-adapter-react'
import { ON_USD } from '~/utils/constants'

const Collaterals = ({ hasNoCollateral, collaterals, onRefetchData }: { hasNoCollateral: boolean, collaterals: Collateral[], onRefetchData: () => void }) => {
  const { publicKey } = useWallet()
  const [openEditCollateral, setOpenEditCollateral] = useState(false)
  const setMintUsdi = useSetAtom(mintUSDi)
  const EditCollateralDialog = dynamic(() => import('./Dialogs/EditCollateralDialog'))

  let dataCollaterals = collaterals
  if (publicKey && hasNoCollateral) {
    const onUSDInfo = collateralMapping(StableCollateral.onUSD)
    dataCollaterals = [{
      tickerIcon: onUSDInfo.collateralIcon,
      tickerSymbol: onUSDInfo.collateralSymbol,
      tickerName: onUSDInfo.collateralName,
      collAmount: 0,
      collAmountDollarPrice: 0
    }]
  }

  const rowsCollateral = dataCollaterals.map((coll, id) => ({
    ...coll,
    id,
    setMintUsdi
  }))

  const handleRowClick: GridEventListener<'rowClick'> = useCallback(() => {
    setOpenEditCollateral(true)
  }, [])

  let customOverlayMsg = ''
  if (!publicKey) {
    customOverlayMsg = 'Please connect wallet.'
  }

  return (
    <>
      <Grid
        headers={columns}
        rows={rowsCollateral || []}
        minHeight={108}
        noAutoHeight={!publicKey}
        customNoRowsOverlay={() => CustomNoRowsOverlay(customOverlayMsg)}
        onRowClick={handleRowClick}
      />

      <EditCollateralDialog
        open={openEditCollateral}
        isNewDeposit={hasNoCollateral}
        onRefetchData={onRefetchData}
        handleClose={() => setOpenEditCollateral(false)}
      />
    </>
  )

}

let columns: GridColDef[] = [
  {
    field: 'collType',
    headerClassName: '',
    cellClassName: '',
    headerName: 'Collateral Type',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return (
        <CellTicker tickerIcon={params.row.tickerIcon} tickerName={params.row.tickerName} tickerSymbol={params.row.tickerSymbol} />
      )
    },
  },
  {
    field: 'depositAmount',
    headerClassName: 'right--header',
    cellClassName: 'right--cell',
    headerName: 'Deposit Amount',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      const collAmount = params.row.collAmount
      return <Typography variant='p_xlg' color={collAmount === 0 ? '#66707e' : '#fff'}>{collAmount.toLocaleString()}</Typography>
    },
  },
  {
    field: 'usdValue',
    headerClassName: 'right--header',
    cellClassName: 'right--cell',
    headerName: 'Value ($)',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      const collUsdValue = params.row.collAmountDollarPrice * params.row.collAmount
      return <Typography variant='p_xlg' color={collUsdValue === 0 ? '#66707e' : '#fff'}>${collUsdValue.toLocaleString()}</Typography>
    },
  },
  {
    field: 'action',
    headerClassName: 'right--header',
    cellClassName: 'right--cell',
    headerName: '',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return (
        // <GetButton onClick={(e) => { e.stopPropagation(); params.row.setMintUsdi(true) }}><Typography variant='p'>Get {ON_USD}</Typography></GetButton>
        <></>
      )
    },
  },
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

const GetButton = styled(Button)`
  width: 130px;
  height: 30px;
  flex-grow: 0;
  border-radius: 5px;
  color: #fff;
  border: solid 1px ${(props) => props.theme.basis.shadowGloom};
  background: ${(props) => props.theme.basis.jurassicGrey};
  &:hover {
    background: ${(props) => props.theme.basis.jurassicGrey};
    border: solid 1px ${(props) => props.theme.basis.gloomyBlue};
  }
`

export default Collaterals