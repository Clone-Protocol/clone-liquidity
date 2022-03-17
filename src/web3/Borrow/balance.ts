import { PublicKey } from '@solana/web3.js'
import { Incept } from 'sdk/src'

export const fetchBalance = async ({ program, userPubKey, index }: GetProps) => {
	if (!userPubKey) return null

	await program.loadManager()

	let usdiVal = 0.0
	let iassetVal = 0.0

	try {
		usdiVal = await program.getUsdiBalance()
	} catch {}

	try {
		iassetVal = await program.getiAssetBalance(index)
	} catch {}

	return {
		usdiVal: usdiVal,
		iassetVal: iassetVal,
	}
}

interface GetProps {
	program: Incept
	userPubKey: PublicKey | null
	index: number
}

export interface Balance {
	usdiVal: number
	iassetVal: number
}
