import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'

interface GridProps {
  headers: GridColDef[],
  rows: any,
  onRowClick: any,
  minHeight?: number
}

const CustomNoRowsOverlay = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '60px', fontSize: '12px', fontWeight: '500', color: '#fff'}}>
      No position to display.
    </Box>
  )
}

export const Grid: React.FC<GridProps> = ({ headers, rows, minHeight = 260, onRowClick }) => (
  <DataGrid
    sx={{
      border: 0,
      color: '#fff',
      minHeight: `${minHeight}px`,
      '& .last--cell': {
        display: 'flex',
        justifyContent: 'flex-end',
        marginRight: '4px',
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        color: '#9d9d9d', 
        fontSize: '11px'
      },
      '& .last--header': {
        '& .MuiDataGrid-columnHeaderTitleContainer': {
          display: 'flex',
          justifyContent: 'flex-end'
        }
      },
      '& .MuiDataGrid-columnHeaders': {
        border: '0'
      },
      '& .MuiDataGrid-columnHeader:focus': {
        outline: 'none',
      },
      '& .MuiDataGrid-columnSeparator': {
        display: 'none',
      },
      '& .MuiDataGrid-row': {
        marginBottom: '12px',
        marginRight: '10px',
        borderRadius: '10px',
        background: '#2d2d2d'
      },
      '& .MuiDataGrid-row:hover': {
        backgroundColor: 'rgba(38, 38, 38, 0.8)'
      },
      '& .MuiDataGrid-cell': {
        borderBottom: '0',
      },
      '& .MuiDataGrid-cell:focus': {
        border: '0',
        outline: 'none'
      },
      '& .MuiDataGrid-cell:focus-within': {
        outline: 'none !important'
      },
      '& .MuiDataGrid-withBorder': {
        borderRight: '0px solid #1b1b1b',
        borderRadius: '10px',
        marginLeft: '-5px'
      },
    }}
    components={{
      NoResultsOverlay: CustomNoRowsOverlay
    }}
    getRowClassName={(params) => 'super-app-theme--row'}
    disableColumnFilter
    disableSelectionOnClick
    disableColumnSelector
    disableColumnMenu
    disableDensitySelector
    disableExtendRowFullWidth
    hideFooter
    headerHeight={40}
    rowHeight={52}
    rowCount={20}
    columns={headers}
    onRowClick={onRowClick}
    rows={rows || []}
  />
)
