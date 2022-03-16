import { Box, Stack, RadioGroup, FormControlLabel, Radio, Button, Tabs, Tab } from '@mui/material'
import Image from 'next/image'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { PoolList } from '~/features/MyLiquidity/CometPools.query'
import Link from 'next/link'
import { RiskButton, StableButton, InactiveButton } from '~/components/Liquidity/LiquidityButton'

interface Props {
  pools: PoolList[] | undefined
}

const GridComet: React.FC<Props> = ({ pools }) => {

  return (
    <DataGrid
      sx={{
        border: 0,
        color: '#fff'
      }}
      getRowClassName={(params) => "super-app-theme--row"}
      disableColumnFilter
      disableSelectionOnClick
      disableColumnSelector
      disableColumnMenu
      disableDensitySelector
      disableExtendRowFullWidth
      hideFooter
      rowHeight={100}
      autoHeight
      columns={columns}
      rows={pools || []}
    />
  )
}

let columns: GridColDef[] = [
	{ field: 'pools', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', headerName: 'Pools', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box display="flex" justifyContent="flex-start">
        <Image src={params.row.tickerIcon} width="40px" height="40px" />
        <Stack sx={{ marginLeft: '32px' }}>
          <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.row.tickerName}</Box>
          <Box sx={{ color: '#6c6c6c', fontSize: '12px', fontWeight: '500' }}>{params.row.tickerSymbol}</Box>
        </Stack>
      </Box>
    )
  } },
	{ field: 'iPrice', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', headerName: 'Indicator price', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'cPrice', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', headerName: 'Center price', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'priceRange', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', headerName: 'Price range', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.row.fromPriceRange.toFixed(2)} - {params.row.toPriceRange.toFixed(2)}</Box>
    )
  }},
	{ field: 'collateral', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', headerName: 'Collateral', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'ild', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', headerName: 'ILD', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'action', 
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: '', 
    flex: 2, 
    renderCell(params: GridRenderCellParams<string>) {
      return (
        <Box display="flex">
          <RiskButton>Recenter</RiskButton>
          <Link href={`/liquidity/comet/${params.row.id}/manage`}>
            <RiskButton>Manage</RiskButton>
          </Link>
        </Box>
      )
    }
  },
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withCsrOnly(GridComet)