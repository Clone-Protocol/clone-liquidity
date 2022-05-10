export enum FilterTypeMap {
	'all' = 'All',
	'crypto' = 'Crypto',
  'fx' = 'FX',
	'commodities' = 'Commodities',
	'stocks' = 'Stocks',
}
export type FilterType = keyof typeof FilterTypeMap