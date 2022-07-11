import { useState } from 'react'
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
	// {
	// 	field: 'iPrice',
	// 	headerClassName: 'super-app-theme--header',
	// 	cellClassName: 'super-app-theme--cell',
	// 	headerName: 'Indicator price',
	// 	flex: 1,
	// 	renderCell(params: GridRenderCellParams<string>) {
  //     return <CellDigitValue value={params.value} symbol="USDi" />
	// 	},
	// },
	// {
	// 	field: 'cPrice',
	// 	headerClassName: 'super-app-theme--header',
	// 	cellClassName: 'super-app-theme--cell',
	// 	headerName: 'Center price',
	// 	flex: 1,
	// 	renderCell(params: GridRenderCellParams<string>) {
  //     return <CellDigitValue value={params.value} symbol="USDi" />
	// 	},
	// },
  {
		field: 'collateral',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Collateral',
		flex: 1,
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
			return (
        <MiniPriceRange iPrice={params.row.iPrice} centerPrice={params.row.cPrice} lowerLimit={params.row.fromPriceRange} upperLimit={params.row.toPriceRange} max={params.row.cPrice * 2} />
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
      return (
        <Box sx={{ width: '80px', textAlign: 'center'}}>
          <CellDigitValue value={params.value} symbol="%" />
        </Box>
      )
		},
	},
	{
		field: 'action',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: '',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
      const [openRecenter, setOpenRecenter] = useState(false)

			return (
				<Box display="flex">
					<StableButton onClick={() => setOpenRecenter(true)}>Recenter</StableButton>
					<Link href={`/liquidity/comet/${params.row.id}/manage`}>
						<DefaultButton>Manage</DefaultButton>
					</Link>


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
