import React, { useState } from 'react'
import { Box } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { CellDigitValue, Grid, CellTicker } from '~/components/Common/DataGrid'
import Link from 'next/link'
import { StableButton, DefaultButton } from '~/components/Liquidity/LiquidityButton'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { useCometPoolsQuery } from '~/features/MyLiquidity/CometPools.query'
import { FilterType } from '~/data/filter'
import { useWallet } from '@solana/wallet-adapter-react'
import MiniPriceRange from '~/components/Liquidity/comet/MiniPriceRange'
import RecenterDialog from '~/containers/Liquidity/comet/RecenterDialog'
import { formatHealthScore } from '~/utils/numbers'

interface Props {
	filter: FilterType
}

const GridComet: React.FC<Props> = ({ filter }) => {
	const { publicKey } = useWallet()

	const { data: cometPools } = useCometPoolsQuery({
		userPubKey: publicKey,
		filter,
		refetchOnMount: "always",
		enabled: publicKey != null
	})

	return (
		<Grid
			headers={columns}
			rows={cometPools || []}
			minHeight={380}
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
		field: 'collateral',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Collateral',
		flex: 1,
		// renderHeader: () => (
		// 	<React.Fragment>
		// 		Collateral	 
		// 		<InfoTooltip title={TooltipTexts.collateralDesignated} />
		// 	</React.Fragment>
		// ),
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<CellDigitValue value={params.value} symbol="USDi" />
			)
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
		field: 'priceRange',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Price range',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return (isNaN(params.row.cPrice)) ? <></> :
				(
					<MiniPriceRange iPrice={params.row.iPrice} centerPrice={params.row.cPrice} lowerLimit={params.row.fromPriceRange} upperLimit={params.row.toPriceRange} max={params.row.toPriceRange} />
				)
		},
	},
	{
		field: 'healthScore',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Health Score',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
			return (isNaN(params.row.cPrice)) ? <></> :
				(
					<Box sx={{ width: '65px', textAlign: 'center' }}>
						<CellDigitValue value={formatHealthScore(Number(params.value))} symbol="%" />
					</Box>
				)
		},
	},
	{
		field: 'action',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'last--cell',
		headerName: '',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
			const [openRecenter, setOpenRecenter] = useState(false)

			return (
				<Box display="flex">
					<StableButton onClick={() => setOpenRecenter(true)} disabled={isNaN(params.row.cPrice)}>Recenter</StableButton>
					<Link href={`/liquidity/comet/${params.row.id}/manage`}>
						<DefaultButton>Manage</DefaultButton>
					</Link>

					<RecenterDialog
						assetId={params.row.id}
						centerPrice={params.row.cPrice}
						open={openRecenter}
						handleClose={() => setOpenRecenter(false)}
					/>
				</Box>
			)
		},
	},
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(GridComet, <LoadingProgress />)
