import React from 'react'
import { Box } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { CellDigitValue, Grid, CellTicker } from '~/components/Common/DataGrid'
import Link from 'next/link'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { FilterType } from '~/data/filter'
import { useBorrowQuery } from '~/features/MyLiquidity/Borrow.query'
import { useWallet } from '@solana/wallet-adapter-react'
import { DefaultButton } from '~/components/Liquidity/LiquidityButton'
import InfoTooltip from '~/components/Common/InfoTooltip'

interface Props {
	filter: FilterType
}

const GridBorrow: React.FC<Props> = ({ filter }) => {
  const { publicKey } = useWallet()

  const { data: assets } = useBorrowQuery({
    userPubKey: publicKey,
    filter,
	  refetchOnMount: "always",
    enabled: publicKey != null
	})

	return (
    <Grid
      headers={columns}
      rows={assets || []}
			minHeight={380}
    />
	)
}

const oraclePriceColTooltipText = `The "true" price of the real world asset represented by the 
iAsset you have borrowed. This price is what is used to calculate your collateral ratio.`

const borrowedColTooltipText = `The amount of iAsset borrowed, also referred to as the your debt.`
const collateralColTooltipText = `The amount of collateral backing your borrow position.`
const collateralRatioTooltipText = `Designates the ratio in terms of value of the collateral and the borrowed iAsset. 
For example, if you borrow $100 of iSOL with 200 USDi, then the collateral ratio is 200%. A borrow position is subject 
to liquidation if the ratio falls below 150%, but we recommend opening a position with a safer ratio of atleast 250%.`

let columns: GridColDef[] = [
	{
		field: 'asset',
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
		field: 'oPrice',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		flex: 1,
		renderHeader: () => (
			<React.Fragment>
				Oracle price	 
				<InfoTooltip title={oraclePriceColTooltipText} />
			</React.Fragment>
		),
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="USD" />
		},
	},
	{
		field: 'borrowed',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		flex: 1,
		renderHeader: () => (
			<React.Fragment>
				Borrowed	 
				<InfoTooltip title={borrowedColTooltipText} />
			</React.Fragment>
		),
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol={params.row.tickerSymbol} />
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
			return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: 'collateralRatio',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		flex: 2,
		renderHeader: () => (
			<React.Fragment>
				Collateral Ratio	 
				<InfoTooltip title={collateralRatioTooltipText} />
			</React.Fragment>
		),
		renderCell(params: GridRenderCellParams<string>) {
			return params.row.borrowed > 0 ?
			 (<Box sx={{ fontSize: '12px', fontWeight: '600' }}>{params.value?.toLocaleString()}% <span style={{ fontSize: '11px', fontWeight: '500' }}>(min {params.row.minCollateralRatio.toLocaleString()}%)</span></Box>)
			 : (<></>)
		},
	},
	{
		field: 'action',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'last--cell',
		headerName: '',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<Box display="flex">
					<Link href={`/liquidity/borrow/${params.row.id}/manage`}>
						<DefaultButton>Manage</DefaultButton>
					</Link>
				</Box>
			)
		},
	},
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(GridBorrow, <LoadingProgress />)
