import { TokenData, BorrowPositions } from "clone-protocol-sdk/sdk/src/interfaces";
import { toNumber } from "clone-protocol-sdk/sdk/src/decimal";


export const getUserMintInfos = (tokenData: TokenData, borrowPositions: BorrowPositions) => {
  const mintInfos = [];
  for (let i = 0; i < Number(borrowPositions.numPositions); i++) {
    let borrowPosition = borrowPositions.borrowPositions[i];
    let poolIndex = borrowPosition.poolIndex;
    let collateralIndex = borrowPosition.collateralIndex;
    let pool = tokenData.pools[poolIndex];
    let assetInfo = pool.assetInfo;
    let collateral = tokenData.collaterals[collateralIndex];
    let collateralAmount = toNumber(borrowPosition.collateralAmount);
    let price = toNumber(assetInfo.price);
    let borrowedOnasset = toNumber(borrowPosition.borrowedOnasset);
    let collateralRatio: Number;
    let minCollateralRatio: Number;
    if (collateral.stable) {
      collateralRatio = collateralAmount / (price * borrowedOnasset);
      minCollateralRatio = toNumber(assetInfo.stableCollateralRatio);
    } else {
      let collateralAssetInfo = tokenData.pools[collateral.poolIndex.toNumber()].assetInfo;
      let collateralPrice = toNumber(collateralAssetInfo.price);
      let collateralAmount = toNumber(borrowPosition.collateralAmount);
      collateralRatio =
        (collateralPrice * collateralAmount) / (price * borrowedOnasset);
      minCollateralRatio = toNumber(assetInfo.cryptoCollateralRatio);
    }
    mintInfos.push([
      poolIndex,
      collateralIndex,
      price,
      borrowedOnasset,
      collateralAmount,
      collateralRatio,
      minCollateralRatio,
    ]);
  }
  return mintInfos;
}
