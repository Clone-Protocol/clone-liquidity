import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid'
import { Box } from '@mui/material'

interface GridProps {
  headers: GridColDef[],
  rows: any,
  onRowClick: (params: GridRowParams) => void,
  minHeight?: number
}

const CustomNoRowsOverlay = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '60px', fontSize: '12px', fontWeight: '500', color: '#fff' }}>
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
        marginRight: '6px',
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        color: '#9d9d9d',
        fontSize: '11px'
      },
      '& .last--header': {
        '& .MuiDataGrid-columnHeaderTitleContainer': {
          display: 'flex',
          justifyContent: 'flex-end',
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
        marginBottom: '10px',
        marginRight: '10px',
        borderRadius: '10px',
        background: '#2d2d2d',
        cursor: 'pointer'
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
      '& .disabled--row': {
        backgroundColor: '#1c1b1b',
        cursor: 'default'
      }
    }}
    components={{
      NoResultsOverlay: CustomNoRowsOverlay
    }}
    getRowClassName={(params) => {
      return rows[params.id]?.isEnabled ? 'super-app-theme--row' : 'disabled--row'
    }}
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
