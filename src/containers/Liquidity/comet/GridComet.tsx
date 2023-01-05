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
import InfoTooltip from '~/components/Common/InfoTooltip'

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

const collateralColTooltipText = `Designates the amount of collateral provided to back the comet.`
const ildColTooltipText = `Stands for Impermanent Loss Debt and represents the amount of debt needed to be payed to offset 
the impermanent loss and close or recenter the position.`

const priceRangeColTooltipText = `The range within which the designated comet postion will remain active. If the iAsset price 
leaves this range it is likely that the position will be subject to liquidation.`

const healthScoreColTooltipText = `The health score gives you a sense of the level of danger of the comet. A higher score means
 a lower risk of future liquidation. If the score reaches 0, the position is subject to liquidiation.`

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
		flex: 1,
		renderHeader: () => (
			<React.Fragment>
				Collateral	 
				<InfoTooltip title={collateralColTooltipText} />
			</React.Fragment>
		),
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
		flex: 1,
		renderHeader: () => (
			<React.Fragment>
				ILD	 
				<InfoTooltip title={ildColTooltipText} />
			</React.Fragment>
		),
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: 'priceRange',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		flex: 1,
		renderHeader: () => (
			<React.Fragment>
				Price range	 
				<InfoTooltip title={priceRangeColTooltipText} />
			</React.Fragment>
		),
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
		flex: 2,
		renderHeader: () => (
			<React.Fragment>
				Health Score	 
				<InfoTooltip title={healthScoreColTooltipText} />
			</React.Fragment>
		),
		renderCell(params: GridRenderCellParams<string>) {
			return (isNaN(params.row.cPrice)) ? <></> :
				(
					<Box sx={{ width: '65px', textAlign: 'center' }}>
						<CellDigitValue value={params.value?.toFixed(2)} symbol="%" />
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
