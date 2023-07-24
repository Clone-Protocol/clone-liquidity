import React from 'react'
import { Typography } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { CellDigitValue, Grid, CellTicker, GridType } from '~/components/Common/DataGrid'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { FilterType } from '~/data/filter'
import { useBorrowQuery } from '~/features/MyLiquidity/Borrow.query'
import { useWallet } from '@solana/wallet-adapter-react'
import { GridEventListener } from '@mui/x-data-grid'
import { CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { useRouter } from 'next/navigation'

interface Props {
	filter: FilterType
}

const GridBorrow: React.FC<Props> = ({ filter }) => {
	const { publicKey } = useWallet()
	const router = useRouter()

	const { data: assets } = useBorrowQuery({
		userPubKey: publicKey,
		filter,
		refetchOnMount: "always",
		enabled: publicKey != null
	})

	const handleRowClick: GridEventListener<'rowClick'> = (
		params,
	) => {
		router.push(`/liquidity/borrow/${params.row.id}`)
	}

	return (
		<Grid
			headers={columns}
			rows={assets || []}
			minHeight={380}
			hasRangeIndicator={true}
			gridType={GridType.Borrow}
			customNoRowsOverlay={() => CustomNoRowsOverlay('Your active borrow positions will appear here.')}
			onRowClick={handleRowClick}
		/>
	)
}

let columns: GridColDef[] = [
	{
		field: 'asset',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'onAsset',
		flex: 1,
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
			return (
				<>
					$<CellDigitValue value={params.value} symbol="USD" />
				</>
			)
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
			return <CellDigitValue value={params.value} symbol="onUSD" />
		},
	},
	{
		field: 'collateralRatio',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Collateral Ratio',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			const isRisk = params.row.collateralRatio - params.row.minCollateralRatio < 20
			return params.row.borrowed > 0 ?
				(<><Typography variant='p' color={isRisk ? '#ed2525' : '#fff'}>{params.value?.toLocaleString()}% (min {params.row.minCollateralRatio.toLocaleString()}%)</Typography></>)
				: (<></>)
		},
	},
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(GridBorrow, <LoadingProgress />)
