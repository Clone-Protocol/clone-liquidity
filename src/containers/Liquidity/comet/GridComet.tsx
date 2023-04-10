import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { CellDigitValue, Grid, CellTicker, GridType } from '~/components/Common/DataGrid'
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

export const enum HealthScoreType {
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
	const [openRecenter, setOpenRecenter] = useState(false)
	const [selRecenterAssetId, setSelRecenterAssetId] = useState('')

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
				let scoreTypeColor = HealthScoreType.Normal;
				if (params.row.healthScore < 20) {
					scoreTypeColor = HealthScoreType.Poor
				} else if (params.row.healthScore >= 20 && params.row.healthScore < 45) {
					scoreTypeColor = HealthScoreType.Warning
				}

				return (isNaN(params.row.cPrice)) ? <></> :
					(
						<MiniPriceRange iPrice={params.row.iPrice} centerPrice={params.row.cPrice} lowerLimit={params.row.fromPriceRange} upperLimit={params.row.toPriceRange} max={params.row.toPriceRange} scoreTypeColor={scoreTypeColor} />
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
				let scoreTypeColor = HealthScoreType.Normal;
				let scoreTypeName = 'Good'
				if (params.row.healthScore < 20) {
					scoreTypeColor = HealthScoreType.Poor
					scoreTypeName = 'Poor'
				} else if (params.row.healthScore >= 20 && params.row.healthScore < 45) {
					scoreTypeColor = HealthScoreType.Warning
					scoreTypeName = 'Fair'
				}

				return (isNaN(params.row.cPrice)) ? <></> :
					(
						<Box sx={{ width: '65px', textAlign: 'center', color: scoreTypeColor }}>
							<CellDigitValue value={formatHealthScore(Number(params.value))} /> <Typography variant='p' color={scoreTypeColor}>({scoreTypeName})</Typography>
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
				const showRecenterDialog = (e: any) => {
					e.stopPropagation()
					if (!isNaN(params.row.cPrice)) {
						setSelRecenterAssetId(params.row.id)
						setOpenRecenter(true)
					}
				}

				return (
					<Box>
						<RecenterButton onClick={showRecenterDialog} />
					</Box>
				)
			},
		},
	]
	columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

	return (
		<>
			<Grid
				headers={columns}
				rows={cometPools || []}
				minHeight={380}
				hasRangeIndicator={true}
				gridType={GridType.SingleComet}
				customNoRowsOverlay={() => CustomNoRowsOverlay('Your active Singlepool Comet liquidity positions will appear here.')}
				onRowClick={handleRowClick}
			/>
			{selRecenterAssetId !== '' &&
				<RecenterDialog
					assetId={selRecenterAssetId}
					open={openRecenter}
					handleClose={() => setOpenRecenter(false)}
				/>
			}
		</>
	)
}

export default withSuspense(GridComet, <LoadingProgress />)
