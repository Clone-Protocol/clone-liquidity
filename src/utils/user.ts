import { Oracles, Pools } from "clone-protocol-sdk/sdk/generated/clone";
import { fromScale, fromCloneScale } from "clone-protocol-sdk/sdk/src/clone";


export const getUserMintInfos = (pools: Pools, oracles: Oracles, borrowPositions: BorrowPositions) => {
  const mintInfos = [];
  for (let i = 0; i < Number(borrowPositions.numPositions); i++) {
    let borrowPosition = borrowPositions.positions[i];
    let poolIndex = borrowPosition.poolIndex;
    let collateralIndex = borrowPosition.collateralIndex;
    let pool = pools.pools[poolIndex];
    let oracle = oracles.oracles[Number(pool.assetInfo.oracleInfoIndex)];
    let assetInfo = pool.assetInfo;
    let collateral = pools.collaterals[collateralIndex];
    let collateralAmount = fromScale(borrowPosition.collateralAmount, collateral.scale);
    let price = fromScale(oracle.price, oracle.expo);
    let borrowedOnasset = fromCloneScale(borrowPosition.borrowedOnasset);
    let collateralRatio: Number;
    let minCollateralRatio: Number;
    if (collateral.stable) {
      collateralRatio = collateralAmount / (price * borrowedOnasset);
      minCollateralRatio = fromScale(assetInfo.stableCollateralRatio, 2);
    } else {
      let collateralAssetInfo = pools.pools[collateral.poolIndex.toNumber()].assetInfo;
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
