import { Box, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useState } from 'react'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { Grid } from '~/components/Common/DataGrid'
import { CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { RankIndex } from '~/components/Points/RankItems'
import { shortenAddress } from '~/utils/address'
import { useRankingQuery } from '~/features/Points/Ranking.query'

const RankingList: React.FC = () => {
  const { data: rankList } = useRankingQuery({
    refetchOnMount: true,
    enabled: true
  })

  return (
    <PanelBox>
      <Grid
        headers={columns}
        rows={rankList || []}
        minHeight={110}
        hasTopBorderRadius={true}
        customNoRowsOverlay={() => CustomNoRowsOverlay('No Rank')}
      />
    </PanelBox>
  )
}

const formatUserDisplayName = ({ name, address }: { name: string | undefined, address: string }) => {
  const displayName = name ?? address;
  return shortenAddress(displayName, 15, 6)
}

let columns: GridColDef[] = [
  {
    field: 'rank',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: 'Ranking',
    flex: 0,
    renderCell(params: GridRenderCellParams<string>) {
      return (
        <Box display='flex' justifyContent='center' width='50px'>
          <RankIndex rank={params.value} />
        </Box>
      )
    },
  },
  {
    field: 'user',
    headerClassName: 'super-app-theme--header',
    cellClassName: 'super-app-theme--cell',
    headerName: `User`,
    flex: 1,
    renderCell(params: GridRenderCellParams<{ name: string | undefined, address: string }>) {
      return <a href={`https://solana.fm/address/${params.value!.address.toString()}`} target='_blank' rel='noreferrer' style={{ color: '#fff' }}>
        <Typography variant='p_xlg' sx={{ ':hover': { color: '#4fe5ff' } }}>{formatUserDisplayName(params.value!)}</Typography>
      </a>
    },
  },
  {
    field: 'lpPoints',
    headerClassName: 'super-app-theme--header right--header',
    cellClassName: 'super-app-theme--cell right--cell',
    headerName: 'Liquidity Points',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_lg'>{params.value?.toLocaleString()}</Typography>
    },
  },
  {
    field: 'tradePoints',
    headerClassName: 'super-app-theme--header right--header',
    cellClassName: 'super-app-theme--cell right--cell',
    headerName: 'Trade Points',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_lg'>{params.value?.toLocaleString()}</Typography>
    },
  },
  {
    field: 'socialPoints',
    headerClassName: 'super-app-theme--header right--header',
    cellClassName: 'super-app-theme--cell right--cell',
    headerName: 'Social Points',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_lg'>{params.value?.toLocaleString()}</Typography>
    },
  },
  {
    field: 'totalPoints',
    headerClassName: 'super-app-theme--header right--header',
    cellClassName: 'super-app-theme--cell right--cell',
    headerName: 'Total Points',
    flex: 1,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p_lg'>{params.value?.toLocaleString()}</Typography>
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
