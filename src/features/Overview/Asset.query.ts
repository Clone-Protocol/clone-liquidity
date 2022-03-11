
export const fetchAsset = async () => {
	return {
    collAmount: 0.0,
    collRatio: 50,
    mintAmount: 0.0,
    lowerLimit: 80.95,
    centerPrice: 110.78,
    upperLimit: 120.95
  }
}

// interface GetProps {
//   program: Incept,
//   userPubKey: PublicKey | null,
// }

export interface AssetData {
  collAmount: number
  collRatio: number
  mintAmount: number
  lowerLimit: number
  centerPrice: number
  upperLimit: number 
}