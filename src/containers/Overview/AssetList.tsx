import { Box, Stack } from '@mui/material'
import { styled } from '@mui/system'
import Image from 'next/image'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useState, useCallback } from 'react'
import { LoadingProgress } from '~/components/Common/Loading'
import withSuspense from '~/hocs/withSuspense'
import { useAssetsQuery } from '~/features/Overview/Assets.query'
import { FilterType, FilterTypeMap } from '~/data/filter'
import Divider from '@mui/material/Divider';
import { useRecoilValue } from 'recoil'
import { isAlreadyInitializedAccountState } from '~/features/globalAtom'
import { PageTabs, PageTab } from '~/components/Overview/Tabs'
import TradeIcon from 'public/images/trade-icon.svg'
import { CellDigitValue, Grid, CellTicker } from '~/components/Common/DataGrid'
import SearchInput from '~/components/Overview/SearchInput'
import useDebounce from '~/hooks/useDebounce'
import { useOnLinkNeedingAccountClick } from '~/hooks/useOnLinkNeedingAccountClick'
import { GridEventListener } from '@mui/x-data-grid'
import { CustomNoRowsOverlay } from '~/components/Common/DataGrid'
import { openConnectWalletGuideDlogState } from '~/features/globalAtom'
import { useSetRecoilState } from 'recoil'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { MARKETS_APP } from '~/data/social'

const AssetList: React.FC = () => {
	const [filter, setFilter] = useState<FilterType>('all')
	const [searchTerm, setSearchTerm] = useState('')
	const debounceSearchTerm = useDebounce(searchTerm, 500)

	const { connected } = useWallet()
	const router = useRouter()
	const setOpenConnectWalletGuideDlogState = useSetRecoilState(openConnectWalletGuideDlogState)

	const { data: assets } = useAssetsQuery({
		filter,
		searchTerm: debounceSearchTerm ? debounceSearchTerm : '',
		refetchOnMount: "always",
		enabled: true
	})

	const handleFilterChange = (event: React.SyntheticEvent, newValue: FilterType) => {
		setFilter(newValue)
	}

	const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newVal = e.currentTarget.value
		if (newVal) {
			setSearchTerm(newVal)
		} else {
			setSearchTerm('')
		}
	}, [searchTerm])

	const isAlreadyInitializedAccount = useRecoilValue(isAlreadyInitializedAccountState)
	const handleLinkNeedingAccountClick = useOnLinkNeedingAccountClick()

	const handleRowClick: GridEventListener<'rowClick'> = (
		params
	) => {
		if (isAlreadyInitializedAccount) {
			if (connected) {
				router.push(`/assets/${params.row.ticker}`)
			} else {
				setOpenConnectWalletGuideDlogState(true)
			}
		} else {
			handleLinkNeedingAccountClick(undefined)
		}
	}

	return (
		<PanelBox>
			<Stack mb={2} direction="row" justifyContent="space-between" alignItems="center">
				<PageTabs value={filter} onChange={handleFilterChange}>
					{Object.keys(FilterTypeMap).map((f) => (
						<PageTab key={f} value={f} label={FilterTypeMap[f as FilterType]} />
					))}
				</PageTabs>
				<SearchInput onChange={handleSearch} />
			</Stack>
			<Divider sx={{ backgroundColor: '#535353' }} />
			<Grid
				headers={columns}
				rows={assets || []}
				minHeight={680}
				customNoRowsOverlay={() => CustomNoRowsOverlay('No assets')}
				onRowClick={handleRowClick}
			/>
		</PanelBox>
	)
}

let columns: GridColDef[] = [
	{
		field: 'iAsset',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'onAsset',
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
			return <CellDigitValue value={params.value} symbol="onUSD" />
		},
	},
	{
		field: 'liquidity',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: 'Liquidity',
		flex: 2,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.value} symbol="onUSD" />
		},
	},
	{
		field: '24hVolume',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: '24h Volume',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.row.volume24h} symbol="onUSD" />
		},
	},
	{
		field: 'feeRevenue24h',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'super-app-theme--cell',
		headerName: '24h Fee Revenue',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			return <CellDigitValue value={params.row.feeRevenue24h} symbol="onUSD" />
		},
	},
	{
		field: 'action',
		headerClassName: 'super-app-theme--header',
		cellClassName: 'last--cell',
		headerName: '',
		flex: 1,
		renderCell(params: GridRenderCellParams<string>) {
			const goToTrading = (e: any) => {
				e.stopPropagation()
				const url = `${MARKETS_APP}/trade/${params.row.ticker}`
				window.open(url)
			}

			return (
				<TradeButton onClick={goToTrading}>
					<Image src={TradeIcon} />
				</TradeButton>
			)
		},
	},
]

const PanelBox = styled(Box)`
	padding: 18px 36px;
  color: #fff;
  & .super-app-theme--header { 
    color: #9d9d9d; 
    font-size: 11px; 
  }
`
const TradeButton = styled(Box)`
	width: 25px;
	height: 25px;
	flex-grow: 0;
	padding: 2px 4px 4px 7px;
	cursor: pointer;
`

columns = columns.map((col) => Object.assign(col, { hideSortIcons: true, filterable: false }))

export default withSuspense(AssetList, <LoadingProgress />)
