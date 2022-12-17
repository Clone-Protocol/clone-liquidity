import { Router } from 'next/router'

export interface LinkRecord {
	path: string
	requiresAccount: boolean
	classNameFunc: (router: Router) => string
}

export interface LinkRecords {
	[key: string]: LinkRecord
}

export const Links: LinkRecords = {
	"overview": {
		path: "/",
		text: "Overview",
		requiresAccount: true,
		classNameFunc: (router) => (router.asPath === '/' || router.asPath.startsWith('/assets') ? 'selected' : '')  
	},
	"liquidity": {
		path: "/liquidity",
		text: "My Liquidity",
		requiresAccount: true,
		classNameFunc: (router) => router.asPath.startsWith('/liquidity') ? 'selected' : ''
	},
	"borrow": {
		path: "/borrow",
		text: "Borrow",
		requiresAccount: true,
		classNameFunc: (router) => router.asPath.startsWith('/borrow') ? 'selected' : ''
	}
} 