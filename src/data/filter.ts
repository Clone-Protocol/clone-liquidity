export enum FilterTypeMap {
	'all' = 'All',
	'crypto' = 'clCrypto',
	// 'fx' = 'clFX',
	'commodities' = 'clCommodity',
}
export type FilterType = keyof typeof FilterTypeMap