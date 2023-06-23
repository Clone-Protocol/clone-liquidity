export enum FilterTypeMap {
	'all' = 'All',
	'crypto' = 'onCrypto',
	'fx' = 'onFX',
	'commodities' = 'onCommodities',
	'stocks' = 'onStocks',
}
export type FilterType = keyof typeof FilterTypeMap