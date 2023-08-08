import { TokenDataArgs, BorrowPositions } from "clone-protocol-sdk/sdk/generated/clone";
import { fromScale, fromCloneScale } from "clone-protocol-sdk/sdk/src/clone";


export const getUserMintInfos = (tokenData: TokenDataArgs, borrowPositions: BorrowPositions) => {
  const mintInfos = [];
  for (let i = 0; i < Number(borrowPositions.numPositions); i++) {
    let borrowPosition = borrowPositions.positions[i];
    let poolIndex = borrowPosition.poolIndex;
    let collateralIndex = borrowPosition.collateralIndex;
    let pool = tokenData.pools[poolIndex];
    let oracle = tokenData.oracles[Number(pool.assetInfo.oracleInfoIndex)];
    let assetInfo = pool.assetInfo;
    let collateral = tokenData.collaterals[collateralIndex];
    let collateralAmount = fromScale(borrowPosition.collateralAmount, collateral.scale);
    let price = fromScale(oracle.price, oracle.expo);
    let borrowedOnasset = fromCloneScale(borrowPosition.borrowedOnasset);
    let collateralRatio: Number;
    let minCollateralRatio: Number;
    if (collateral.stable) {
      collateralRatio = collateralAmount / (price * borrowedOnasset);
      minCollateralRatio = fromScale(assetInfo.stableCollateralRatio, 2);
    } else {
      let collateralAssetInfo = tokenData.pools[collateral.poolIndex.toNumber()].assetInfo;
      let collateralPrice = toNumber(collateralAssetInfo.price);
      let collateralAmount = fromScale(borrowPosition.collateralAmount, collateral.scale);
      collateralRatio =
        (collateralPrice * collateralAmount) / (price * borrowedOnasset);
      minCollateralRatio = fromScale(assetInfo.cryptoCollateralRatio, 2);
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
