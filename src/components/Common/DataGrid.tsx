import { DataGrid, GridColDef, GridEventListener } from '@mui/x-data-grid'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'

interface GridProps {
  headers: GridColDef[],
  rows: any,
  customNoRowsOverlay: () => JSX.Element,
  hasRangeIndicator?: boolean,
  gridType?: GridType,
  minHeight?: number,
  noAutoHeight?: boolean
  hasTopBorderRadius?: boolean
  onRowClick?: GridEventListener<'rowClick'>
}

export const enum GridType {
  Normal = 'normal',
  SingleComet = 'singleComet',
  Borrow = 'borrow'
}

export const Grid: React.FC<GridProps> = ({ headers, rows, customNoRowsOverlay, hasRangeIndicator = false, gridType = GridType.Normal, minHeight = 260, noAutoHeight = false, hasTopBorderRadius = false, onRowClick }) => (
  <DataGrid

    sx={{
      width: '100%',
      border: 0,
      color: '#fff',
      minHeight: `${minHeight}px`,
      '& .MuiDataGrid-main': {
        border: '1px solid #1a1c28',
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '10px',
        borderTopLeftRadius: hasTopBorderRadius ? '10px' : '0px',
        borderTopRightRadius: hasTopBorderRadius ? '10px' : '0px',
      },
      '& .right--cell': {
        display: 'flex',
        justifyContent: 'flex-end',
        paddingRight: '40px'
      },
      '& .last--cell': {
        display: 'flex',
        justifyContent: 'flex-end',
        maxWidth: '180px'
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        color: '#989898',
        fontSize: '12px',
        lineHeight: 1.33,
        marginLeft: '10px'
      },
      '& .right--header': {
        '& .MuiDataGrid-columnHeaderTitleContainer': {
          display: 'flex',
          justifyContent: 'flex-end',
          paddingRight: '20px'
        }
      },
      '& .last--header': {
        '& .MuiDataGrid-columnHeaderTitleContainer': {
          display: 'flex',
          justifyContent: 'right',
          marginRight: '35px'
        }
      },
      '& .MuiDataGrid-columnHeaders': {
        borderBottom: '1px solid #1a1c28',
      },
      '& .MuiDataGrid-columnHeader:focus': {
        outline: 'none',
      },
      '& .MuiDataGrid-columnSeparator': {
        display: 'none',
      },
      '& .MuiDataGrid-row': {
        marginRight: '10px',
        paddingLeft: '10px',
        cursor: 'pointer'
      },
      '& .MuiDataGrid-row:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)'
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
      '.border-warning--row': {
        borderLeft: '1px solid #ff8e4f',
        borderRight: '1px solid #ff8e4f',
      },
      '.border-poor--row': {
        borderLeft: '1px solid #ed2525',
        borderRight: '1px solid #ed2525'
      },
    }}
    components={{
      NoResultsOverlay: customNoRowsOverlay
    }}
    getRowClassName={(params) => {
      if (hasRangeIndicator) {
        if (gridType === GridType.SingleComet) {
          //validate healthscore
          if (params.row.healthScore < 20) {
            return 'border-poor--row'
          } else if (params.row.healthScore >= 20 && params.row.healthScore < 45) {
            return 'border-warning--row'
          }
        } else if (gridType === GridType.Borrow) {
          if (params.row.collateralRatio - params.row.minCollateralRatio < 20) {
            return 'border-poor--row'
          }
        }
      }
      return 'super-app-theme--row'
    }}
    autoHeight={!noAutoHeight}
    disableColumnFilter
    disableSelectionOnClick
    disableColumnSelector
    disableColumnMenu
    disableDensitySelector
    disableExtendRowFullWidth
    hideFooter
    headerHeight={38}
    rowHeight={72}
    rowCount={20}
    onRowClick={onRowClick}
    columns={headers}
    rows={rows || []}
  />
)

export const CustomNoRowsOverlay = (msg: string, color?: string) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '25px' }}>
      <Typography variant='p_lg' color={color || '#66707e'}>{msg}</Typography>
    </Box>
  )
}

export interface TickerType {
  tickerIcon: string
  tickerName: string
  tickerSymbol: string
}

export const CellTicker: React.FC<TickerType> = ({ tickerIcon, tickerName, tickerSymbol }) => (
  <Box display="flex" justifyContent="flex-start">
    {tickerIcon && <Image src={tickerIcon} width={27} height={27} alt={tickerSymbol} />}
    <Box display='flex' alignItems='center' ml='10px'>
      <Box sx={{ maxWidth: '200px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <Typography variant='p_xlg'>{tickerName}</Typography>
      </Box>
      <Box sx={{ color: '#989898' }} ml='10px'>
        <Typography variant='p_xlg'>{tickerSymbol}</Typography>
      </Box>
    </Box>
  </Box>
)

export const CellDigitValue = ({ value, symbol }: { value: string | undefined, symbol?: string }) => (
  <Typography variant='p_xlg'>{value && value.toLocaleString(undefined, { maximumFractionDigits: 5 })} {symbol}</Typography>
)