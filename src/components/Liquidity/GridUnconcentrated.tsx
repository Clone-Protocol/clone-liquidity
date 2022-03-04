import React, { useState } from 'react'
import { Box, Stack, RadioGroup, FormControlLabel, Radio, Button, Tabs, Tab } from '@mui/material'
import Image from 'next/image'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { styled } from '@mui/system'
import { PoolList } from '~/features/MyLiquidity/UnconcentratedPools.query'
import Link from 'next/link'
import DepositDialog from '~/containers/Liquidity/unconcentrated/DepositDialog'
import WithdrawDialog from '~/containers/Liquidity/unconcentrated/WithdrawDialog'

interface Props {
  pools: PoolList[] | undefined
}

const GridUnconcentrated: React.FC<Props> = ({ pools }) => {

  return (
    <>
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
        rows={pools || []}
      />
    </>
  )
}

let columns: GridColDef[] = [
	{ field: 'pools', headerName: 'Pools', flex: 1, renderCell(params: GridRenderCellParams<string>) {
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
	{ field: 'price', headerName: 'iAsset price', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'liquidityAsset', headerName: 'Liquidity (iAsset)', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'liquidityUSD', headerName: 'Liquidity (USDi)', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
	{ field: 'liquidityVal', headerName: 'Liquidity value', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'action', 
    headerName: '', 
    flex: 2, 
    renderCell(params: GridRenderCellParams<string>) {
      const [openDeposit, setOpenDeposit] = React.useState(false)
      const [openWithdraw, setOpenWithdraw] = React.useState(false)
      return (
        <Box display="flex">
          <RiskButton onClick={() => setOpenDeposit(true)}>Deposit</RiskButton>
          <RiskButton onClick={() => setOpenWithdraw(true)}>Withdraw</RiskButton>

          <DepositDialog open={openDeposit} handleClose={() => setOpenDeposit(false)} />
          <WithdrawDialog open={openWithdraw} handleClose={() => setOpenWithdraw(false)} />
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

export default withCsrOnly(GridUnconcentrated)