import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { styled } from '@mui/system'
import { Box, Stack } from '@mui/material'
import Image from 'next/image'

interface GridProps {
  headers: GridColDef[],
  rows: any
}

export const Grid: React.FC<GridProps> = ({ headers, rows }) => (
  <DataGrid
    sx={{
      border: 0,
      color: '#fff',
      '& .last--cell': {
        display: 'flex',
        justifyContent: 'flex-end'
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        color: '#9d9d9d', 
        fontSize: '13px'
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
        border: '1px solid #535353',
        marginBottom: '32px',
        marginRight: '10px',
        borderRadius: '10px'
      },
      '& .MuiDataGrid-cell': {
        borderBottom: '0',
      },
      '& .MuiDataGrid-withBorder': {
        borderRight: '1px solid #535353',
        borderRadius: '10px',
        marginLeft: '-5px'
      }
    }}
    getRowClassName={(params) => 'super-app-theme--row'}
    disableColumnFilter
    disableSelectionOnClick
    disableColumnSelector
    disableColumnMenu
    disableDensitySelector
    disableExtendRowFullWidth
    hideFooter
    rowHeight={70}
    autoHeight
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
    <Image src={tickerIcon} width="40px" height="40px" />
    <Stack sx={{ marginLeft: '32px' }}>
      <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{tickerName}</Box>
      <Box sx={{ color: '#6c6c6c', fontSize: '12px', fontWeight: '500' }}>
        {tickerSymbol}
      </Box>
    </Stack>
  </Box>
)

export const CellDigitValue = ({ value, symbol }: {value: string, symbol?: string}) => (
  <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{value.toLocaleString()} <span style={{fontSize: '10px'}}>{symbol}</span></Box>
)