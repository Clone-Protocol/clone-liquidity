import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"
import ethLogo from '/public/images/assets/ethereum-eth-logo.svg'

enum Asset {
	Solana,
	Ethereum,
}

export const fetchBorrowDetail = async ({ program, userPubKey, index }: GetProps) => {
  if (!userPubKey) return 

	await program.loadManager()
	const data = await program.getMintiAssetData(index)
	let tickerSymbol = ''
	switch (index) {
		case Asset.Solana:
			tickerSymbol = 'iSOL'
			break
		case Asset.Ethereum:
			tickerSymbol = 'iETH'
			break
		default:
			throw new Error('Not supported')
	}
	return {
		tickerSymbol: tickerSymbol,
		oPrice: data[1]!,
		stableCollateralRatio: data[2]!,
		cryptoCollateralRatio: data[3]!,
	}
}

interface GetProps {
  program: Incept,
  userPubKey: PublicKey | null,
  index: number
}

export interface PositionInfo {
	tickerSymbol: string
	oPrice: number
	stableCollateralRatio: number
	cryptoCollateralRatio: number
}