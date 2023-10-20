import { Borrow, Oracles, Pools } from "clone-protocol-sdk/sdk/generated/clone";
import { fromScale, fromCloneScale, CloneClient } from "clone-protocol-sdk/sdk/src/clone";

export interface MintInfo {
  poolIndex: number;
  price: number;
  borrowedOnasset: number;
  collateralAmount: number;
  collateralRatio: number;
  minCollateralRatio: number;
  effectiveCollateralValue: number;
}


export const getUserMintInfos = (program: CloneClient, pools: Pools, oracles: Oracles, borrowPositions: Borrow[]): MintInfo[] => {
  const mintInfos = [];
  const collateral = program.clone.collateral;
  for (let i = 0; i < Number(borrowPositions.length); i++) {
    const borrowPosition = borrowPositions[i];
    const poolIndex = borrowPosition.poolIndex;
    const pool = pools.pools[poolIndex];
    const oracle = oracles.oracles[Number(pool.assetInfo.oracleInfoIndex)];
    const assetInfo = pool.assetInfo;
    const collateralAmount = fromScale(borrowPosition.collateralAmount, collateral.scale);
    const effectiveCollateralValue = collateralAmount * fromScale(collateral.collateralizationRatio, 2);
    const price = fromScale(oracle.price, oracle.expo);
    const borrowedOnasset = fromCloneScale(borrowPosition.borrowedOnasset);
    const collateralRatio = effectiveCollateralValue / (price * borrowedOnasset);
    const minCollateralRatio = fromScale(assetInfo.minOvercollateralRatio, 2);
    mintInfos.push({
      poolIndex,
      price,
      borrowedOnasset,
      collateralAmount,
      collateralRatio,
      minCollateralRatio,
      effectiveCollateralValue,
    });
  }
  return mintInfos;
}
