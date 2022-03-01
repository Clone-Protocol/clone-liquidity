import { Box, Stack, RadioGroup, FormControlLabel, Radio, Button } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useState } from 'react'
import { FilterType, FilterTypeMap, useAssetsQuery } from '~/features/Overview/Assets.query'
import Link from 'next/link'

const AssetList = () => {
  const [filter, setFilter] = useState<FilterType>('all')
  const { data: assets } = useAssetsQuery({
    filter,
    refetchOnMount: 'always'
  })

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilter((event.target as HTMLInputElement).value as FilterType)
	}

  return (
    <Box sx={{ background: '#171717', color: '#fff' }}>
      <Stack mb={2} direction="row" justifyContent="space-between">
        <RadioGroup row value={filter} onChange={handleFilterChange}>
					{Object.keys(FilterTypeMap).map((f) => (
						<FormControlLabel
							key={f}
							value={f}
							control={<Radio />}
							label={FilterTypeMap[f as FilterType]}
						/>
					))}
				</RadioGroup>
      </Stack>
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
    </Box>
  )
}

let columns: GridColDef[] = [
	{ field: 'iAsset', headerName: 'iAsset', flex: 2, renderCell(params: GridRenderCellParams<string>) {
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
	{ field: 'price', headerName: 'Price', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'liquidity', headerName: 'Liquidity', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: '24hVolume', headerName: '24h Volume', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.row.volume24h.toLocaleString()} USDi</Box>
    )
  }},
	{ field: 'baselineAPY', headerName: 'Baseline APY', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '16px', fontWeight: '500' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'action', 
    headerName: '', 
    flex: 1, 
    renderCell(params: GridRenderCellParams<string>) {
      return (
        <Link href="/assets/1/asset">
          <Button>+/-</Button>
        </Link>
      )
    }
  },
]

const TradeButton = styled(Button)`
  border-radius: 8px;
  background-color: rgba(235, 237, 242, 0.97);
  font-size: 12px;
  font-weight: 600;
  width: 100px;
  height: 30px;
`

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, resizable: true, filterable: false }))

export default AssetList