import { PublicKey } from "@solana/web3.js"
import { Incept } from "sdk/src"
import ethLogo from '/public/images/assets/ethereum-eth-logo.svg'

enum Asset {
	Euro,
	Gold,
	Solana,
	Ethereum,
	Bitcoin,
	Luna,
	Avalanche,
	Tesla,
	Apple,
	Amazon
}

export const fetchBorrowDetail = async ({ program, userPubKey, index }: GetProps) => {
  if (!userPubKey) return 

	await program.loadManager()
	const data = await program.getMintiAssetData(index)
	let tickerIcon = ''
	let tickerSymbol = ''
	switch (index) {
		case Asset.Euro:
			tickerSymbol = 'iEUR'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Gold:
			tickerSymbol = 'iSPTSGD'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Solana:
			tickerSymbol = 'iSOL'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Ethereum:
			tickerSymbol = 'iETH'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Bitcoin:
			tickerSymbol = 'iBTC'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Luna:
			tickerSymbol = 'iLUNA'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Avalanche:
			tickerSymbol = 'iAVAX'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Tesla:
			tickerSymbol = 'iTLSA'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Apple:
			tickerSymbol = 'iAAPL'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
			break
		case Asset.Amazon:
			tickerSymbol = 'iAMZN'
			tickerIcon = '/images/assets/ethereum-eth-logo.svg'
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

export const fetchPositionDetail = async ( program: Incept, userPubKey: PublicKey, index: number ) => {
	if (!userPubKey) return 
  
	  await program.loadManager()

	  const data = await program.getUserMintInfo(index)

	  return data
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
	borrowedIasset: number
	collateralAmount: number
	collateralRatio: number
	minCollateralRatio: number
}

export interface PairData {
	tickerIcon: string
	tickerName: string
	tickerSymbol: string
	balance: number
	amount: number
}