import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import Image from 'next/image'

interface GridProps {
  headers: GridColDef[],
  rows: any
}

const CustomNoRowsOverlay = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '60px', fontSize: '12px', fontWeight: '500', color: '#fff'}}>
      No position to display.
    </Box>
  )
}

export const Grid: React.FC<GridProps> = ({ headers, rows }) => (
  <DataGrid
    sx={{
      border: 0,
      color: '#fff',
      minHeight: '280px',
      '& .last--cell': {
        display: 'flex',
        justifyContent: 'flex-end'
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        color: '#9d9d9d', 
        fontSize: '11px'
      },
      '& .last--header': {
        '& .MuiDataGrid-columnHeaderTitle': {
          marginLeft: '20px'
        }
      },
      '& .MuiDataGrid-columnHeaders': {
        border: '0'
      },
      '& .MuiDataGrid-columnSeparator': {
        display: 'none',
      },
      '& .MuiDataGrid-row': {
        marginBottom: '12px',
        marginRight: '10px',
        borderRadius: '10px',
        background: '#1b1b1b'
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
        borderRight: '1px solid #1b1b1b',
        borderRadius: '10px',
        marginLeft: '-5px'
      }
    }}
    components={{
      NoRowsOverlay: CustomNoRowsOverlay
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
    columns={headers}
    rows={rows || []}
  />
)

export interface TickerType {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string
}

export const CellTicker: React.FC<TickerType> = ({ tickerIcon, tickerName, tickerSymbol }) => (
  <Box display="flex" justifyContent="flex-start">
    <Image src={tickerIcon} width="27px" height="27px" />
    <Box sx={{ marginLeft: '32px', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ display: 'block', fontSize: '14px', fontWeight: '500', maxWidth: '100px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{tickerName}</Box>
      <Box sx={{ color: '#6c6c6c', fontSize: '12px', fontWeight: '500', marginLeft: '8px', marginTop: '3px' }}>
        {tickerSymbol}
      </Box>
    </Box>
  </Box>
)

export const CellDigitValue = ({ value, symbol }: {value: string | undefined, symbol?: string}) => (
  <Box sx={{ fontSize: '12px', fontWeight: '500', marginLeft: '1px' }}>{value && value.toLocaleString()} <span style={{fontSize: '11px'}}>{symbol}</span></Box>
)