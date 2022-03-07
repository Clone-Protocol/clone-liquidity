import { Box, Stack, RadioGroup, FormControlLabel, Radio, Tabs, Tab, Button } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useState } from 'react'
import { FilterType, FilterTypeMap, useAssetsQuery } from '~/features/Overview/Assets.query'
import Link from 'next/link'
import { PageTabs, PageTab } from '~/components/Overview/Tabs'
import TradeIcon from 'public/images/trade-icon.png'
import ChangePositionIcon from 'public/images/change-position-icon.png'

const AssetList = () => {
  const [filter, setFilter] = useState<FilterType>('all')
  const { data: assets } = useAssetsQuery({
    filter,
    refetchOnMount: 'always'
  })

  const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterType) => {
		setFilter(newValue)
	}

  return (
    <Box sx={{ background: '#171717', color: '#fff', '& .super-app-theme--header': {color: '#9d9d9d', fontSize: '13px'} }}>
      <Stack mb={2} direction="row" justifyContent="space-between">
        <PageTabs value={filter} onChange={handleFilterChange}>
          {Object.keys(FilterTypeMap).map((f) => (
            <PageTab 
            	key={f}
							value={f}
              label={FilterTypeMap[f as FilterType]}
            />
					))}
        </PageTabs>
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
	{ field: 'iAsset', headerClassName: 'super-app-theme--header', headerName: 'iAsset', flex: 2, renderCell(params: GridRenderCellParams<string>) {
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
	{ field: 'price', headerClassName: 'super-app-theme--header', headerName: 'Price', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: 'liquidity', headerClassName: 'super-app-theme--header', headerName: 'Liquidity', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.value.toLocaleString()} USDi</Box>
    )
  }},
  { field: '24hVolume', headerClassName: 'super-app-theme--header', headerName: '24h Volume', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.row.volume24h.toLocaleString()} USDi</Box>
    )
  }},
	{ field: 'baselineAPY', headerClassName: 'super-app-theme--header', headerName: 'Baseline APY', flex: 1, renderCell(params: GridRenderCellParams<string>) {
    return (
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.value.toLocaleString()} %</Box>
    )
  }},
  { field: 'action', 
    headerName: '', 
    flex: 1, 
    renderCell(params: GridRenderCellParams<string>) {
      return (
        <Stack direction="row" spacing={2}>
          <Link href="/assets/1/asset">
            <ChangePositionButton><Image src={ChangePositionIcon} /></ChangePositionButton>
          </Link>
          <Link href="/assets/1/asset">
            <TradeButton><Image src={TradeIcon} /></TradeButton>
          </Link>
        </Stack>
      )
    }
  },
]

const ChangePositionButton = styled(Box)`
  width: 25px;
  height: 25px;
  flex-grow: 0;
  padding: 5.6px 5px 5.6px;
  border-radius: 4px;
  border: solid 1px #00f0ff;
  cursor: pointer;
`

const TradeButton = styled(Box)`
  width: 25px;
  height: 25px;
  flex-grow: 0;
  padding: 4px 5.7px 3px 6px;
  border-radius: 4px;
  border: solid 1px #fff;
  cursor: pointer;
`

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, resizable: true, filterable: false }))

export default AssetList