import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useState } from 'react'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useAssetsQuery } from '~/features/Overview/Assets.query'
import { Grid, CellTicker } from '~/components/Common/DataGrid'
import { CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { formatDollarAmount } from '~/utils/numbers'
import { RankIndex } from '~/components/Points/RankItems'

const RankingList: React.FC = () => {
  const { data: assets } = useAssetsQuery({
    filter: 'all',
    searchTerm: '',
    refetchOnMount: true,
    enabled: true
  })

  return (
    <PanelBox>
      <Grid
        headers={columns}
        rows={assets || []}
        minHeight={110}
        hasTopBorderRadius={true}
        customNoRowsOverlay={() => CustomNoRowsOverlay('No Rank')}
      />
    </PanelBox>
  )
}

let columns: GridColDef[] = [
  {
    field: 'ranking',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'Ranking',
    flex: 2,
    renderCell(params: GridRenderCellParams<string>) {
      return (
        <CellTicker tickerIcon={params.row.tickerIcon} tickerName={params.row.tickerName} tickerSymbol={params.row.tickerSymbol} />
      )
    },
  },
  {
    field: 'userAddr',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: `User`,
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>${params.value?.toLocaleString()}</Typography>
    },
  },
  {
    field: 'lpPoints',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'LP Points',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>${params.value?.toLocaleString()}</Typography>
    },
  },
  {
    field: 'tradePoints',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'Trade Points',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>{formatDollarAmount(Number(params.value), 3)}</Typography>
    },
  },
  {
    field: 'socialPoints',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'Social Points',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>{formatDollarAmount(Number(params.row.volume24h), 3)}</Typography>
    },
  },
  {
    field: 'totalPoints',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'Total Points',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_xlg'>${params.value?.toLocaleString()}</Typography>
    },
  },
]

const PanelBox = styled(Box)`
	padding: 18px 36px;
  color: #fff;
  & .super-app-theme--header { 
    color: #9d9d9d; 
    font-size: 11px; 
  }
`

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(RankingList, <LoadingProgress />)
