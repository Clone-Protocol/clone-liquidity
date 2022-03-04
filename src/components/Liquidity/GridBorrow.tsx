import { Box, Stack, RadioGroup, FormControlLabel, Radio, Button, Tabs, Tab } from '@mui/material'
import Image from 'next/image'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { AssetList } from '~/features/MyLiquidity/Borrow.query'
import Link from 'next/link'

interface Props {
  assets: AssetList[] | undefined
}

const GridBorrow: React.FC<Props> = ({ assets }) => {

  return (
    <DataGrid
      sx={{
        border: 0,
        color: '#fff'
      }}
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
      rows={assets || []}
    />
  )
}

let columns: GridColDef[] = [
	{ field: 'asset', headerName: 'iAsset', flex: 1, renderCell(params: GridRenderCellParams<string>) {
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
	{ field: 'oPrice', headerName: 'Oracle price', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'borrowed', headerName: 'Borrowed', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
	{ field: 'collateral', headerName: 'Collateral', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'collateralRatio', headerName: 'Collateral Ratio', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'action', 
    headerName: '', 
    flex: 2, 
    renderCell(params: GridRenderCellParams<string>) {
      return (
        <Box display="flex">
          <Link href="/liquidity/borrow/1/manage"><RiskButton>Manage</RiskButton></Link>
        </Box>
      )
    }
  },
]

const RiskButton = styled(Button)`
  width: 84px;
  height: 33px;
  margin: 6px;
  border-radius: 8px;
  border: solid 1px #ff2929;
  color: #FFF;
  font-size: 12px;
  font-weight: 600;
`

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, resizable: true, filterable: false }))

export default withCsrOnly(GridBorrow)