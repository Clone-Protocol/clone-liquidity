export enum FilterTypeMap {
	'all' = 'All',
	'crypto' = 'onCrypto',
	'fx' = 'onFX',
	'commodities' = 'onCommodity',
}
export type FilterType = keyof typeof FilterTypeMap