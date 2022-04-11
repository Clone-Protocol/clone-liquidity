import { Box, Stack } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useState } from 'react'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useAssetsQuery } from '~/features/Overview/Assets.query'
import { FilterType, FilterTypeMap } from '~/data/filter'
// import { AssetList as AssetListType, FilterType, FilterTypeMap, fetchAssets } from '~/web3/Overview/Assets'
import Divider from '@mui/material/Divider';
import Link from 'next/link'
import { PageTabs, PageTab } from '~/components/Overview/Tabs'
import TradeIcon from 'public/images/trade-icon.png'
import ChangePositionIcon from 'public/images/change-position-icon.png'
import { useWallet } from '@solana/wallet-adapter-react'
import { CellDigitValue, Grid, CellTicker } from '~/components/Common/DataGrid'

const AssetList: React.FC = () => {
	const [filter, setFilter] = useState<FilterType>('all')
	const { publicKey } = useWallet()

	const { data: assets } = useAssetsQuery({
    userPubKey: publicKey,
    filter,
	  refetchOnMount: true,
    enabled: publicKey != null
	})

	const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterType) => {
		setFilter(newValue)
	}

	return (
		<Box
			sx={{
				background: '#171717',
				color: '#fff',
        padding: '30px',
        borderRadius: '4px',
        '& .super-app-theme--header': { color: '#9d9d9d', fontSize: '11px' },
				// '& .super-app-theme--row': { background: '#1b1b1b' },
				// '& .super-app-theme--cell': { borderBottom: 'solid 1px #535353' },
			}}>
			<Stack mb={2} direction="row" justifyContent="space-between">
				<PageTabs value={filter} onChange={handleFilterChange}>
					{Object.keys(FilterTypeMap).map((f) => (
						<PageTab key={f} value={f} label={FilterTypeMap[f as FilterType]} />
					))}
				</PageTabs>
			</Stack>
      <Divider sx={{ backgroundColor: '#fff' }} />
      <Grid
        headers={columns}
				rows={assets || []}
      />
		</Box>
	)
}

let columns: GridColDef[] = [
	{
		field: 'iAsset',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'iAsset',
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
		headerName: 'Price',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: 'liquidity',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Liquidity',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="USDi" />
		},
	},
	{
		field: '24hVolume',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: '24h Volume',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.row.volume24h} symbol="USDi" />
		},
	},
	{
		field: 'baselineAPY',
		headerClassName: 'last--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Baseline APY',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <Box sx={{ fontSize: '14px', fontWeight: '600', textAlign: 'center', margin: '0 auto' }}>{params.value.toLocaleString()} %</Box>
		},
	},
	{
		field: 'action',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'last--cell',
		headerName: '',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return (
        <Stack direction="row" spacing={1}>
          <Link href={`/assets/${params.row.id}/asset`}>
            <ChangePositionButton>
              <Image src={ChangePositionIcon} />
            </ChangePositionButton>
          </Link>
          <Link href={`/assets/${params.row.id}/asset`}>
            <TradeButton>
              <Image src={TradeIcon} />
            </TradeButton>
          </Link>
        </Stack>
			)
		},
	},
]

const ChangePositionButton = styled(Box)`
	width: 25px;
	height: 25px;
	flex-grow: 0;
	padding: 5.6px 5px 5.6px;
  line-height: 10px;
	border-radius: 4px;
	border: solid 1px #00f0ff;
	cursor: pointer;
`

const TradeButton = styled(Box)`
	width: 25px;
	height: 25px;
	flex-grow: 0;
	padding: 4px 5.7px 3px 6px;
	border-radius: 4px;
	border: solid 1px #fff;
	cursor: pointer;
`

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(AssetList, <LoadingProgress />)
