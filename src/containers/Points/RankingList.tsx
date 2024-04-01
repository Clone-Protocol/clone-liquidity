import { Box, Typography, Tooltip } from '@mui/material'
import { styled } from '@mui/system'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { Grid } from '~/components/Common/DataGrid'
import { CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { RankIndex } from '~/components/Points/RankItems'
import { shortenAddress } from '~/utils/address'
import { useRankingQuery } from '~/features/Points/Ranking.query'
import { RankingList } from '~/features/Points/Ranking.query'
import { PythSymbolIcon } from '~/components/Common/SvgIcons'
import { PointTextForPyth } from '~/components/Points/PointMultiplierText'
import { TooltipTexts } from '~/data/tooltipTexts'
import { formatLocaleAmount } from '~/utils/numbers'

const RankingList = () => {
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
    headerName: 'Rank',
    flex: 1,
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
    flex: 3,
    renderCell(params: GridRenderCellParams<{ name: string | undefined, address: string }>) {
      const hasPythPoint = params.row.hasPythPoint
      return <Box display='flex' alignItems='center' gap={1}>
        <a href={`https://solana.fm/address/${params.value!.address.toString()}`} target='_blank' rel='noreferrer' style={{ color: '#fff' }}>
          <Typography variant='p_lg' sx={{ ':hover': { color: '#4fe5ff' } }}>{formatUserDisplayName(params.value!)}</Typography>
        </a>
        {hasPythPoint &&
          <Tooltip title={TooltipTexts.points.pythSymbol} placement="top">
            <Box display='flex' alignItems='center' sx={{ color: '#e6dafe', ':hover': { color: '#9b90b1' } }}>
              <PythSymbolIcon />
            </Box>
          </Tooltip>
        }
      </Box>
    },
  },
  {
    field: 'lpPoints',
    headerClassName: 'super-app-theme--header right--header',
    cellClassName: 'super-app-theme--cell right--cell',
    headerName: 'LP Points',
    flex: 2,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p'>{formatLocaleAmount(params.value)}</Typography>
    },
  },
  {
    field: 'tradePoints',
    headerClassName: 'super-app-theme--header right--header',
    cellClassName: 'super-app-theme--cell right--cell',
    headerName: 'Trade Points',
    flex: 2,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p'>{formatLocaleAmount(params.value)}</Typography>
    },
  },
  {
    field: 'socialPoints',
    headerClassName: 'super-app-theme--header right--header',
    cellClassName: 'super-app-theme--cell right--cell',
    headerName: 'Social Points',
    flex: 2,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p'>{formatLocaleAmount(params.value)}</Typography>
    },
  },
  {
    field: 'referralPoints',
    headerClassName: 'super-app-theme--header right--header',
    cellClassName: 'super-app-theme--cell right--cell',
    headerName: 'Referral Points',
    flex: 2,
    renderCell(params: GridRenderCellParams<string>) {
      return <Typography variant='p'>{formatLocaleAmount(params.value)}</Typography>
    },
  },
  {
    field: 'totalPoints',
    headerClassName: 'super-app-theme--header right--header',
    cellClassName: 'super-app-theme--cell right--cell',
    headerName: 'Total Points',
    flex: 3,
    renderCell(params: GridRenderCellParams<string>) {
      const hasPythPoint = params.row.hasPythPoint
      const pythPointTier = params.row.pythPointTier
      return <Box display='flex' alignItems='center' gap='7px'>
        <Typography variant='p'>{formatLocaleAmount(params.value)}</Typography>
        {hasPythPoint &&
          <Tooltip title={TooltipTexts.points.multiplier} placement="top">
            <Box><PointTextForPyth pythPointTier={pythPointTier} /></Box>
          </Tooltip>
        }
      </Box>
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
  & .MuiDataGrid-columnHeaderTitle {
    text-overflow: initial !important;
  }
`

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(RankingList, <LoadingProgress />)
