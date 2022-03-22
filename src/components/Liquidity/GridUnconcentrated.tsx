import { useState } from 'react'
import { Box } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { withCsrOnly } from '~/hocs/CsrOnly'
import { PoolList } from '~/features/MyLiquidity/UnconcentratedPools.query'
import DepositDialog from '~/containers/Liquidity/unconcentrated/DepositDialog'
import WithdrawDialog from '~/containers/Liquidity/unconcentrated/WithdrawDialog'
import { CellDigitValue, Grid, CellTicker } from '~/components/Common/DataGrid'
import { RiskButton, StableButton, InactiveButton } from '~/components/Liquidity/LiquidityButton'

interface Props {
	pools: PoolList[] | undefined
}

const GridUnconcentrated: React.FC<Props> = ({ pools }) => {
	return (
		<Grid
      headers={columns}
      rows={pools || []}
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
		field: 'price',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'iAsset price',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: 'liquidityAsset',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Liquidity (iAsset)',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return (
        <CellDigitValue value={params.value} symbol={params.row.tickerSymbol} />
			)
		},
	},
	{
		field: 'liquidityUSD',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Liquidity (USDi)',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: 'liquidityVal',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Liquidity value',
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
			const [openDeposit, setOpenDeposit] = useState(false)
			const [openWithdraw, setOpenWithdraw] = useState(false)
			return (
				<Box display="flex">
					<StableButton onClick={() => setOpenDeposit(true)}>Deposit</StableButton>
					<InactiveButton onClick={() => setOpenWithdraw(true)}>Withdraw</InactiveButton>

					<DepositDialog
						assetId={params.row.id}
						open={openDeposit}
						handleClose={() => setOpenDeposit(false)}
					/>
					<WithdrawDialog
						assetId={params.row.id}
						open={openWithdraw}
						handleClose={() => setOpenWithdraw(false)}
					/>
				</Box>
			)
		},
	},
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, resizable: true, filterable: false }))

export default withCsrOnly(GridUnconcentrated)
