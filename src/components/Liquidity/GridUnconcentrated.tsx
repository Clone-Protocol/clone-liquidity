import React, { useState } from 'react'
import { Box, Stack } from '@mui/material'
import Image from 'next/image'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { PoolList } from '~/features/MyLiquidity/UnconcentratedPools.query'
import DepositDialog from '~/containers/Liquidity/unconcentrated/DepositDialog'
import WithdrawDialog from '~/containers/Liquidity/unconcentrated/WithdrawDialog'
import { RiskButton, StableButton, InactiveButton } from '~/components/Liquidity/LiquidityButton'

interface Props {
  pools: PoolList[] | undefined
}

const GridUnconcentrated: React.FC<Props> = ({ pools }) => {

  return (
    <>
      <DataGrid
        sx={{
          border: 0,
          color: '#fff',
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '1px solid #535353'
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none'
          },
          '& .MuiDataGrid-row': {
            border: '1px solid #535353'
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #535353'
          }
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
        rows={pools || []}
      />
    </>
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
	{ field: 'price', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', headerName: 'iAsset price', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'liquidityAsset', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', headerName: 'Liquidity (iAsset)', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.value.toLocaleString()} {params.row.tickerSymbol}</Box>
    )
  }},
  { field: 'liquidityUSD', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', headerName: 'Liquidity (USDi)', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
	{ field: 'liquidityVal', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', headerName: 'Liquidity value', flex: 1, renderCell(params: GridRenderCellParams<string>) {
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
      const [openDeposit, setOpenDeposit] = React.useState(false)
      const [openWithdraw, setOpenWithdraw] = React.useState(false)
      return (
        <Box display="flex">
          <StableButton onClick={() => setOpenDeposit(true)}>Deposit</StableButton>
          <InactiveButton onClick={() => setOpenWithdraw(true)}>Withdraw</InactiveButton>

          <DepositDialog assetId={params.row.id} open={openDeposit} handleClose={() => setOpenDeposit(false)} />
          <WithdrawDialog assetId={params.row.id} open={openWithdraw} handleClose={() => setOpenWithdraw(false)} />
        </Box>
      )
    }
  },
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, resizable: true, filterable: false }))

export default withCsrOnly(GridUnconcentrated)