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
        marginRight: '4px',
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        color: '#989898',
        fontSize: '12px'
      },
      '& .last--header': {
        '& .MuiDataGrid-columnHeaderTitleContainer': {
          display: 'flex',
          justifyContent: 'right'
        },
        borderRight: '0px !important'
      },
      '& .MuiDataGrid-columnHeaders': {
        borderBottom: '0px',
        marginTop: '-5px'
      },
      '& .MuiDataGrid-columnHeader:focus': {
        outline: 'none',
      },
      '& .MuiDataGrid-columnSeparator': {
        display: 'none',
      },
      '& .MuiDataGrid-row': {
        marginRight: '10px',
        border: '1px solid #3f3f3f',
        cursor: 'pointer',
        marginBottom: '13px'
      },
      '& .MuiDataGrid-row:hover': {
        backgroundColor: '#1b1b1b'
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
        borderRight: '1px solid #3f3f3f',
        marginLeft: '-1px'
      },
    }}
    components={{
      NoResultsOverlay: CustomNoRowsOverlay
    }}
    getRowClassName={(params) => {
      return 'super-app-theme--row'
    }}
    disableColumnFilter
    disableSelectionOnClick
    disableColumnSelector
    disableColumnMenu
    disableDensitySelector
    disableExtendRowFullWidth
    hideFooter
    headerHeight={25}
    rowHeight={50}
    rowCount={20}
    onRowClick={onRowClick}
    columns={headers}
    rows={rows || []}
  />
)
