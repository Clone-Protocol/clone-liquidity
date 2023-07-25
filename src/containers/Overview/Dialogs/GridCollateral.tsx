import { useWallet } from '@solana/wallet-adapter-react'
import { Box, Typography } from '@mui/material'
import { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid'
import { Grid } from '~/components/Liquidity/comet/DataGrid'
import withSuspense from '~/hocs/withSuspense'
import Image from 'next/image'
import { LoadingProgress } from '~/components/Common/Loading'
import { useCollateralsQuery } from '~/features/MyLiquidity/comet/Collaterals.query'

interface Props {
	onChoose: (id: number) => void
}

const GridCollateral: React.FC<Props> = ({ onChoose }) => {
	const { publicKey } = useWallet()
	const { data: collaterals } = useCollateralsQuery({
		userPubKey: publicKey,
		refetchOnMount: "always",
		enabled: publicKey != null
	})

	const handleChoose = (params: GridRowParams) => {
		if (params.row.isEnabled) {
			const id = params.row.id
			onChoose && onChoose(id)
		}
	}

	return (
		<Grid
			headers={columns}
			rows={collaterals || []}
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
					<Image src={params.row.tickerIcon} width={28} height={28} layout="fixed" alt={params.row.tickerSymbol} />
					<Box marginLeft='8px' marginTop='3px'>
						<Typography variant='p_lg'>{params.row.tickerName}</Typography>
						<Typography variant='p_lg' color='#989898' ml='10px'>{params.row.tickerSymbol}</Typography>
					</Box>
				</Box>
			)
		},
	},
	{
		field: 'balance',
		headerClassName: 'last--header',
		cellClassName: 'last--cell',
		headerName: 'Wallet Balance',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <Box><Typography variant='p_lg'>{params.value?.toLocaleString()} USD</Typography></Box>
		},
	},
]

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(GridCollateral, <LoadingProgress />)
