import { Box } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { CellDigitValue, Grid, CellTicker } from '~/components/Common/DataGrid'
import Link from 'next/link'
import { RiskButton, StableButton, InactiveButton } from '~/components/Liquidity/LiquidityButton'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { useCometPoolsQuery } from '~/features/MyLiquidity/CometPools.query'
import { FilterType } from '~/data/filter'
import { useWallet } from '@solana/wallet-adapter-react'

interface Props {
	filter: FilterType
}

const GridComet: React.FC<Props> = ({ filter }) => {
	const { publicKey } = useWallet()

  const { data: cometPools } = useCometPoolsQuery({
    userPubKey: publicKey,
    filter,
	  refetchOnMount: true,
    enabled: publicKey != null
	})
  
	return (
    <Grid
      headers={columns}
      rows={cometPools || []}
    />
	)
}

let columns: GridColDef[] = [
	{
		field: 'pools',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Pools',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
			return (
        <CellTicker tickerIcon={params.row.tickerIcon} tickerName={params.row.tickerName} tickerSymbol={params.row.tickerSymbol} />
			)
		},
	},
	{
		field: 'iPrice',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Indicator price',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
      return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: 'cPrice',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Center price',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
      return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: 'priceRange',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Price range',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<Box sx={{ fontSize: '14px', fontWeight: '600' }}>
					{params.row.fromPriceRange.toFixed(2)} - {params.row.toPriceRange.toFixed(2)}
				</Box>
			)
		},
	},
	{
		field: 'collateral',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Collateral',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
      return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: 'ild',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'ILD',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
      return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: 'action',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: '',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<Box display="flex">
					<StableButton>Recenter</StableButton>
					<Link href={`/liquidity/comet/${params.row.id}/manage`}>
						<InactiveButton>Manage</InactiveButton>
					</Link>
				</Box>
			)
		},
	},
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(GridComet, <LoadingProgress />)
