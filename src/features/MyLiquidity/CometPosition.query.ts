import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'
import { assetMapping } from 'src/data/assets'

export const fetchInitializeCometDetail = async ({ program, userPubKey, index }: GetProps) => {
	if (!userPubKey) return

	await program.loadManager()

	const balances = await program.getPoolBalances(index)
	let price = balances[1] / balances[0]
	let tightRange = price * 0.1
	let maxRange = 2 * price
	let centerPrice = price

  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(index)
	return {
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		price,
		tightRange,
		maxRange,
		centerPrice,
	}
}

export const fetchCometDetail = async ({ program, userPubKey, index }: GetProps) => {
	if (!userPubKey) return

	await program.loadManager()

	let comet = await program.getCometPosition(index)
	const balances = await program.getPoolBalances(comet.poolIndex)
	let price = balances[1] / balances[0]
	let tightRange = price * 0.1
	let maxRange = 2 * price
	let centerPrice = Number(comet.borrowedUsdi.val) / Number(comet.borrowedIasset.val)
  const { tickerIcon, tickerName, tickerSymbol } = assetMapping(Number(comet.poolIndex))

	return {
		tickerIcon: tickerIcon,
		tickerName: tickerName,
		tickerSymbol: tickerSymbol,
		price,
		tightRange,
		maxRange,
		centerPrice,
	}
}

interface GetProps {
	program: Incept
	userPubKey: PublicKey | null
	index: number
}

export interface PositionInfo {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string | null
	price: number
	isTight: boolean
	tightRange: number
	maxRange: number
	collAmount: number
	collRatio: number
	mintAmount: number
	lowerLimit: number
	centerPrice: number
	upperLimit: number
}

