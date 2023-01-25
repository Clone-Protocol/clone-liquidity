import { DataGrid, GridColDef, GridEventListener } from '@mui/x-data-grid'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'

interface GridProps {
  headers: GridColDef[],
  rows: any,
  customNoRowsOverlay: () => JSX.Element,
  minHeight?: number,
  onRowClick?: GridEventListener<'rowClick'>
}

export const Grid: React.FC<GridProps> = ({ headers, rows, customNoRowsOverlay, minHeight = 260, onRowClick }) => (
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
        fontSize: '10px'
      },
      '& .last--header': {
        '& .MuiDataGrid-columnHeaderTitle': {
          marginLeft: '20px'
        }
      },
      '& .MuiDataGrid-columnHeaders': {
        borderBottom: '1px solid #3f3f3f',
      },
      '& .MuiDataGrid-columnHeader:focus': {
        outline: 'none',
      },
      '& .MuiDataGrid-columnSeparator': {
        display: 'none',
      },
      '& .MuiDataGrid-row': {
        marginRight: '10px',
        borderBottom: '1px solid #3f3f3f',
        cursor: 'pointer'
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
        borderRight: '0px solid #1b1b1b',
        marginLeft: '-5px'
      },
      '.border-warning--row': {
        borderLeft: '1px solid #ff8e4f',
        borderRight: '1px solid #ff8e4f',
      },
      '.border-poor--row': {
        borderLeft: '1px solid #ed2525',
        borderRight: '1px solid #ed2525'
      }
      // '.super-app-theme--row': {
      // }
    }}
    components={{
      NoResultsOverlay: customNoRowsOverlay
    }}
    getRowClassName={(params) => {
      //@TODO: set proper position for the row data
      if (params.row.id === 1) {
        return 'border-warning--row'
      } else if (params.row.id === 2) {
        return 'border-poor--row'
      }
      return 'super-app-theme--row'
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
    onRowClick={onRowClick}
    columns={headers}
    rows={rows || []}
  />
)

export const CustomNoRowsOverlay = (msg: string) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '21px' }}>
      <Typography variant='p'>{msg}</Typography>
    </Box>
  )
}

export interface TickerType {
  tickerIcon: string
  tickerName: string
  tickerSymbol: string
}

export const CellTicker: React.FC<TickerType> = ({ tickerIcon, tickerName, tickerSymbol }) => (
  <Box display="flex" justifyContent="flex-start" marginLeft='4px'>
    {tickerIcon && <Image src={tickerIcon} width="27px" height="27px" layout="fixed" />}
    <Box display='flex' alignItems='center' marginLeft='16px'>
      <Box sx={{ maxWidth: '100px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <Typography variant='p_lg'>{tickerName}</Typography>
      </Box>
      <Box sx={{ color: '#989898' }} marginLeft='8px' marginTop='3px'>
        <Typography variant='p'>{tickerSymbol}</Typography>
      </Box>
    </Box>
  </Box>
)

export const CellDigitValue = ({ value, symbol }: { value: string | undefined, symbol?: string }) => (
  <Box marginLeft='5px'><Typography variant='p'>{value && value.toLocaleString(undefined, { maximumFractionDigits: 5 })} {symbol}</Typography></Box>
)