export enum FilterTypeMap {
	'all' = 'All',
	'crypto' = 'iCrypto',
  'fx' = 'iFX',
	'commodities' = 'iCommodities',
	'stocks' = 'iStocks',
}
export type FilterType = keyof typeof FilterTypeMap