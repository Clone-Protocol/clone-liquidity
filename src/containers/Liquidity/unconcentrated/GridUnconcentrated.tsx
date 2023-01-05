import React, { useState } from 'react'
import { Box } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import DepositDialog from '~/containers/Liquidity/unconcentrated/DepositDialog'
import WithdrawDialog from '~/containers/Liquidity/unconcentrated/WithdrawDialog'
import { CellDigitValue, Grid, CellTicker } from '~/components/Common/DataGrid'
import withSuspense from '~/hocs/withSuspense'
import { LoadingProgress } from '~/components/Common/Loading'
import { FilterType } from '~/data/filter'
import { useUnconcentPoolsQuery } from '~/features/MyLiquidity/UnconcentratedPools.query'
import { DefaultButton } from '~/components/Liquidity/LiquidityButton'
import { useWallet } from '@solana/wallet-adapter-react'
import InfoTooltip from '~/components/Common/InfoTooltip'

interface Props {
	filter: FilterType
}

const GridUnconcentrated: React.FC<Props> = ({ filter }) => {
  const { publicKey } = useWallet()

  const { data: pools } = useUnconcentPoolsQuery({
    userPubKey: publicKey,
    filter,
	  refetchOnMount: "always",
    enabled: publicKey != null
	})

	return (
		<Grid
      headers={columns}
      rows={pools || []}
			minHeight={380}
    />
	)
}

const iAssetColTooltipText = `The price of the iAsset on Incept Markets, this value is calculated using the ratio of USDi to iAsset in the pool.`
const liquidityiAssetColTooltipText = `Number of iAsset you have provided to the pool using this unconcentrated liquidity position.`
const liquidityUsdiColTooltipText = `Number of USDi you have provided to the pool using this unconcentrated liquidity position.`
const liquidityValueColTooltipText = `Combined value in USD of the total liquidity you have provided to the pool with this unconcentrated liquidity position. `

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
		flex: 1,
		renderHeader: () => (
			<React.Fragment>
				iAsset price	 
				<InfoTooltip title={iAssetColTooltipText} />
			</React.Fragment>
		),
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
		renderHeader: () => (
			<React.Fragment>
				Liquidity (iAsset)	 
				<InfoTooltip title={liquidityiAssetColTooltipText} />
			</React.Fragment>
		),
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
		flex: 1,
		renderHeader: () => (
			<React.Fragment>
				Liquidity (USDi)	 
				<InfoTooltip title={liquidityUsdiColTooltipText} />
			</React.Fragment>
		),
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: 'liquidityVal',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		flex: 1,
		renderHeader: () => (
			<React.Fragment>
				Liquidity value	 
				<InfoTooltip title={liquidityValueColTooltipText} />
			</React.Fragment>
		),
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="USD" />
		},
	},
	{
		field: 'action',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'last--cell',
		headerName: '',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
			const [openDeposit, setOpenDeposit] = useState(false)
			const [openWithdraw, setOpenWithdraw] = useState(false)

			return (
				<Box display="flex">
					<DefaultButton sx={{ border: '1px solid #809cff'}} onClick={() => setOpenDeposit(true)}>Deposit</DefaultButton>
					<DefaultButton onClick={() => setOpenWithdraw(true)}>Withdraw</DefaultButton>

					<DepositDialog
						assetId={params.row.id}
            pool={params.row}
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

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(GridUnconcentrated, <LoadingProgress />)
