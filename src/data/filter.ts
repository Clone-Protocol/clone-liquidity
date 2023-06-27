export enum FilterTypeMap {
	'all' = 'All',
	'crypto' = 'onCrypto',
	'fx' = 'onFX',
	'commodities' = 'onCommodities',
}
export type FilterType = keyof typeof FilterTypeMap