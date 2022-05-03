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
import TradeIcon from 'public/images/trade-icon.svg'
import ChangePositionIcon from 'public/images/change-position-icon.svg'
import { useWallet } from '@solana/wallet-adapter-react'
import { CellDigitValue, Grid, CellTicker } from '~/components/Common/DataGrid'
import SearchInput from '~/components/Overview/SearchInput'

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
				background: 'rgba(21, 22, 24, 0.75)',
				color: '#fff',
        padding: '18px 36px',
        borderRadius: '10px',
        '& .super-app-theme--header': { color: '#9d9d9d', fontSize: '11px' },
				// '& .super-app-theme--row': { background: '#1b1b1b' },
				// '& .super-app-theme--cell': { borderBottom: 'solid 1px #535353' },
			}}>
			<Stack mb={2} direction="row" justifyContent="space-between" alignItems="center">
				<PageTabs value={filter} onChange={handleFilterChange}>
					{Object.keys(FilterTypeMap).map((f) => (
						<PageTab key={f} value={f} label={FilterTypeMap[f as FilterType]} />
					))}
				</PageTabs>
        <SearchInput />
			</Stack>
      <Divider sx={{ backgroundColor: '#535353' }} />
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
		flex: 3,
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
			return <Box sx={{ fontSize: '12px', fontWeight: '500', textAlign: 'center', margin: '0 auto' }}>{params.value.toLocaleString()} %</Box>
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
	padding: 6px;
  line-height: 10px;
	border-radius: 4px;
	border: solid 1px #535353;
  background-color: #1b377b;
	cursor: pointer;
`

const TradeButton = styled(Box)`
	width: 25px;
	height: 25px;
	flex-grow: 0;
	padding: 3px 5.7px 4px 8px;
	border-radius: 4px;
	border: solid 1px #535353;
	cursor: pointer;
`

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(AssetList, <LoadingProgress />)
