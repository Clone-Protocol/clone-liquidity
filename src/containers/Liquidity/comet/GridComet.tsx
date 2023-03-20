import React, { useState } from 'react'
import { Box } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { CellDigitValue, Grid, CellTicker } from '~/components/Common/DataGrid'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { useCometPoolsQuery } from '~/features/MyLiquidity/CometPools.query'
import { FilterType } from '~/data/filter'
import { useWallet } from '@solana/wallet-adapter-react'
import MiniPriceRange from '~/components/Liquidity/comet/MiniPriceRange'
import { formatHealthScore } from '~/utils/numbers'
import RecenterDialog from '~/containers/Liquidity/comet/RecenterDialog'
import { GridEventListener } from '@mui/x-data-grid'
import { CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { RecenterButton } from '~/components/Liquidity/LiquidityButton'
import { useRouter } from 'next/router'

interface Props {
	filter: FilterType
}

const enum HealthScoreType {
	Normal = '#fff',
	Warning = '#ff8e4f',
	Poor = '#ed2525'
}

// const CustomNoRowsOverlay = () => {
// 	return (
// 		<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '21px' }}>
// 			<Typography variant='p'>Your active Singlepool Comet liquidity positions will appear here.</Typography>
// 		</Box>
// 	)
// }

const GridComet: React.FC<Props> = ({ filter }) => {
	const { publicKey } = useWallet()
	const router = useRouter()

	const { data: cometPools } = useCometPoolsQuery({
		userPubKey: publicKey,
		filter,
		refetchOnMount: "always",
		enabled: publicKey != null
	})

	const handleRowClick: GridEventListener<'rowClick'> = (
		params,
		event
	) => {
		event.preventDefault()
		router.push(`/liquidity/comet/${params.row.id}/manage`)
	}

	return (
		<Grid
			headers={columns}
			rows={cometPools || []}
			minHeight={380}
			customNoRowsOverlay={() => CustomNoRowsOverlay('Your active Singlepool Comet liquidity positions will appear here.')}
			onRowClick={handleRowClick}
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
			const scoreTypeColor = HealthScoreType.Normal;

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
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			const scoreTypeColor = HealthScoreType.Normal;

			return (isNaN(params.row.cPrice)) ? <></> :
				(
					<Box sx={{ width: '65px', textAlign: 'center', color: scoreTypeColor }}>
						<CellDigitValue value={formatHealthScore(Number(params.value))} />
					</Box>
				)
		},
	},
	{
		field: 'action',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'last--cell',
		headerName: '',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			const [isHovering, setIsHovering] = useState(false)
			const [openRecenter, setOpenRecenter] = useState(false)

			const showRecenterDialog = (e: any) => {
				e.stopPropagation()
				if (!isNaN(params.row.cPrice)) {
					setOpenRecenter(true)
				}
			}

			return (
				<Box>
					<RecenterButton onClick={showRecenterDialog} />

					<RecenterDialog
						assetId={params.row.id}
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
