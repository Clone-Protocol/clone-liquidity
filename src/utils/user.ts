import { Borrow, Oracles, Pools } from "clone-protocol-sdk/sdk/generated/clone";
import { fromScale, fromCloneScale, CloneClient } from "clone-protocol-sdk/sdk/src/clone";


export const getUserMintInfos = (program: CloneClient, pools: Pools, oracles: Oracles, borrowPositions: Borrow[]) => {
  const mintInfos = [];
  const collateral = program.clone.collateral;
  for (let i = 0; i < Number(borrowPositions.length); i++) {
    const borrowPosition = borrowPositions[i];
    const poolIndex = borrowPosition.poolIndex;
    const pool = pools.pools[poolIndex];
    const oracle = oracles.oracles[Number(pool.assetInfo.oracleInfoIndex)];
    const assetInfo = pool.assetInfo;
    const collateralAmount = fromScale(borrowPosition.collateralAmount, collateral.scale);
    const price = fromScale(oracle.price, oracle.expo);
    const borrowedOnasset = fromCloneScale(borrowPosition.borrowedOnasset);
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
      0, // collateralIndex
      price,
      borrowedOnasset,
      collateralAmount,
      collateralRatio,
      minCollateralRatio,
    ]);
  }
  return mintInfos;
}
