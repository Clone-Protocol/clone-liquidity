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
	let tickerIcon = ''
	let tickerSymbol = ''
	switch (index) {
		case Asset.Solana:
			tickerIcon = ethLogo
			tickerSymbol = 'iSOL'
			break
		case Asset.Ethereum:
			tickerIcon = ethLogo
			tickerSymbol = 'iETH'
			break
		default:
			throw new Error('Not supported')
	}
	return {
		tickerIcon: ethLogo,
		tickerSymbol: tickerSymbol,
		oPrice: data[0]!,
		stableCollateralRatio: data[1]!,
		cryptoCollateralRatio: data[2]!,
	}
}

interface GetProps {
  program: Incept,
  userPubKey: PublicKey | null,
  index: number
}

export interface PositionInfo {
	tickerIcon: string
	tickerSymbol: string
	oPrice: number
	stableCollateralRatio: number
	cryptoCollateralRatio: number
}

export interface PairData {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string
	balance: number
	amount: number
}