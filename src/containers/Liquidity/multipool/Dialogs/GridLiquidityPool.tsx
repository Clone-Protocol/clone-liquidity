import { useWallet } from '@solana/wallet-adapter-react'
import { Box, styled } from '@mui/material'
import { GridColDef, GridRenderCellParams, GridRowParams, MuiEvent, GridCallbackDetails } from '@mui/x-data-grid'
import { Grid } from '~/components/Liquidity/multipool/DataGrid'
import withSuspense from '~/hocs/withSuspense'
import Image from 'next/image'
import { LoadingProgress } from '~/components/Common/Loading'
import { useLiquidityPoolsQuery } from '~/features/MyLiquidity/multipool/LiquidityPools.query'

interface Props {
	onChoose: (id: number) => void
}

const GridLiquidityPool: React.FC<Props> = ({ onChoose }) => {
	const { publicKey } = useWallet()
	const { data: pools } = useLiquidityPoolsQuery({
		userPubKey: publicKey,
		refetchOnMount: "always",
		enabled: publicKey != null
	})

	const handleChoose = (params: GridRowParams, event: MuiEvent<React.MouseEvent>, details: GridCallbackDetails) => {
		if (params.row.isEnabled) {
			const id = params.row.id
			onChoose && onChoose(id)
		}
	}

	return (
		<Grid
			headers={columns}
			rows={pools || []}
			onRowClick={handleChoose}
			minHeight={380}
		/>
	)
}

let columns: GridColDef[] = [
	{
		field: 'asset',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Asset',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<Box display="flex" justifyContent="flex-start" marginLeft='4px'>
					<Image src={params.row.tickerIcon} width="27px" height="27px" layout="fixed" />
					<Box sx={{ fontSize: '14px', fontWeight: '500', marginLeft: '8px', marginTop: '3px' }}>
						{params.row.tickerSymbol} / USDi
					</Box>
				</Box>
			)
		},
	},
	{
		field: 'totalLiquidity',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Total Liquidity',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellValue>${params.value?.toLocaleString()}</CellValue>
		},
	},
	{
		field: 'volume24H',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: '24h Volume',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellValue>${params.value?.toLocaleString()}</CellValue>
		},
	},
	{
		field: 'averageAPY',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Average APY',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellValue>{params.value?.toLocaleString()}%</CellValue>
		},
	},
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

const CellValue = styled(Box)`
	font-size: 14px;
	text-align: left;
  color: #fff;
`

export default withSuspense(GridLiquidityPool, <LoadingProgress />)
