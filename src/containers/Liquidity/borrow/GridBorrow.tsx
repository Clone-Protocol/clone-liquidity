import { Box, Button } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { styled } from '@mui/system'
import { CellDigitValue, Grid, CellTicker } from '~/components/Common/DataGrid'
import Link from 'next/link'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { FilterType, useBorrowQuery } from '~/features/MyLiquidity/Borrow.query'
import { useWallet } from '@solana/wallet-adapter-react'

interface Props {
	filter: FilterType
}

const GridBorrow: React.FC<Props> = ({ filter }) => {
  const { publicKey } = useWallet()

  const { data: assets } = useBorrowQuery({
    userPubKey: publicKey,
    filter,
	  refetchOnMount: true,
    enabled: publicKey != null
	})

	return (
    <Grid
      headers={columns}
      rows={assets || []}
    />
	)
}

let columns: GridColDef[] = [
	{
		field: 'asset',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'iAsset',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<CellTicker tickerIcon={params.row.tickerIcon} tickerName={params.row.tickerName} tickerSymbol={params.row.tickerSymbol} />
			)
		},
	},
	{
		field: 'oPrice',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Oracle price',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="USD" />
		},
	},
	{
		field: 'borrowed',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Borrowed',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol={params.row.tickerSymbol} />
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
		field: 'collateralRatio',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Collateral Ratio',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <Box sx={{ fontSize: '14px', fontWeight: '600' }}>{params.value.toLocaleString()}%</Box>
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
					<Link href={`/liquidity/borrow/${params.row.id}/manage`}>
						<RiskButton>Manage</RiskButton>
					</Link>
				</Box>
			)
		},
	},
]

const RiskButton = styled(Button)`
	width: 84px;
	height: 33px;
	margin: 6px;
	border-radius: 8px;
	border: solid 1px #ff2929;
	color: #fff;
	font-size: 12px;
	font-weight: 600;
`

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(GridBorrow, <LoadingProgress />)
