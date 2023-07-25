import { useWallet } from '@solana/wallet-adapter-react'
import { Box, Typography } from '@mui/material'
import { GridColDef, GridRenderCellParams, GridRowParams, MuiEvent, GridCallbackDetails } from '@mui/x-data-grid'
import { Grid } from '~/components/Liquidity/comet/DataGrid'
import withSuspense from '~/hocs/withSuspense'
import Image from 'next/image'
import { LoadingProgress } from '~/components/Common/Loading'
import { useLiquidityPoolsQuery } from '~/features/MyLiquidity/comet/LiquidityPools.query'

interface Props {
	onChoose: (id: number) => void
	noFilter: boolean
}

const GridLiquidityPool: React.FC<Props> = ({ onChoose, noFilter }) => {
	const { publicKey } = useWallet()
	const { data: pools } = useLiquidityPoolsQuery({
		userPubKey: publicKey,
		refetchOnMount: "always",
		enabled: publicKey != null,
		noFilter
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
		headerName: 'Pools',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
			return (
				<Box display="flex" justifyContent="flex-start" marginLeft='4px'>
					<Image src={params.row.tickerIcon} width={28} height={28} alt={params.row.tickerSymbol} layout="fixed" />
					<Box marginLeft='8px' marginTop='3px'>
						<Typography variant='p_lg'>{params.row.tickerName}</Typography>
						<Typography variant='p_lg' color='#989898' ml='10px'>{params.row.tickerSymbol} / onUSD</Typography>
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
			return <Box><Typography variant='p_lg'>${params.value?.toLocaleString()} USD</Typography></Box>
		},
	},
	{
		field: 'volume24H',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: '24h Volume',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <Box><Typography variant='p_lg'>${params.value?.toLocaleString()} USD</Typography></Box>
		},
	}
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(GridLiquidityPool, <LoadingProgress />)
