import { TokenData, LiquidityPositions, Comet, MintPositions } from "incept-protocol-sdk/sdk/src/incept";
import { toNumber } from "incept-protocol-sdk/sdk/src/decimal";

export const getUserLiquidityInfos = (tokenData: TokenData, liquidityPositions: LiquidityPositions) => {
    const liquidityInfos = [];
    for (let i = 0; i < Number(liquidityPositions.numPositions); i++) {
      let liquidityPosition = liquidityPositions.liquidityPositions[i];
      let poolIndex = liquidityPosition.poolIndex;
      let pool = tokenData.pools[poolIndex];
      let poolBalances = [toNumber(pool.iassetAmount), toNumber(pool.usdiAmount)];
      let price = poolBalances[1] / poolBalances[0];
      let liquidityTokenAmount = toNumber(
        liquidityPosition.liquidityTokenValue
      );
      let liquidityTokenSupply = toNumber(pool.liquidityTokenSupply);

      let iassetValue =
        (poolBalances[0] * liquidityTokenAmount) / liquidityTokenSupply;
      let usdiValue =
        (poolBalances[1] * liquidityTokenAmount) / liquidityTokenSupply;
      liquidityInfos.push([
        poolIndex,
        price,
        iassetValue,
        usdiValue,
        liquidityTokenAmount,
      ]);
    }
    return liquidityInfos;
}

interface EditCometInfo {
    maxCollateralWithdrawable: number;
    maxUsdiPosition: number;
    healthScore: number;
    lowerPrice: number;
    upperPrice: number;
}

export const getUserSinglePoolCometInfos = (editInfoCalc: (tokenData: TokenData,
    comet: Comet,
    cometIndex: number,
    collateralChange: number,
    usdiBorrowedChange: number) => EditCometInfo , tokenData: TokenData, singlePoolComets: Comet) => {

    let cometInfos = [];
    for (let i = 0; i < Number(singlePoolComets.numPositions); i++) {
      try {
        let cometPosition = singlePoolComets.positions[i];
        let cometCollateral = singlePoolComets.collaterals[i];
        let poolIndex = cometPosition.poolIndex;
        if (Number(poolIndex) === 255) {
          cometInfos.push([
            poolIndex,
            cometCollateral.collateralIndex,
            null,
            null,
            null,
            null,
            toNumber(cometCollateral.collateralAmount),
            null,
            null,
            0,
            0,
            0,
            false,
          ]);
          continue;
        }
        let pool = tokenData.pools[poolIndex];
        let collateralIndex = cometCollateral.collateralIndex;
        let assetInfo = pool.assetInfo;
        let poolBalances = [
          toNumber(pool.usdiAmount),
          toNumber(pool.iassetAmount),
        ];
        let ammPrice = poolBalances[1] / poolBalances[0];
        let oraclePrice = toNumber(assetInfo.price);
        let borrowedIasset = toNumber(cometPosition.borrowedUsdi);
        let borrowedUsdi = toNumber(cometPosition.borrowedIasset);
        let totalCollateralAmount = toNumber(cometCollateral.collateralAmount);
        let data = editInfoCalc(
          tokenData,
          singlePoolComets,
          i,
          0,
          0
        );
        let range = [data.lowerPrice, data.upperPrice];
        let lowerPriceRange = range[0];
        let upperPriceRange = range[1];

        let gaps = [
          oraclePrice - lowerPriceRange,
          ammPrice - lowerPriceRange,
          upperPriceRange - oraclePrice,
          upperPriceRange - ammPrice,
        ];
        let minGapIndex = 0;
        for (let i = 0; i < gaps.length; i++) {
          if (gaps[minGapIndex] > gaps[i]) {
            minGapIndex = i;
          }
        }
        let indicatorPrice =
          minGapIndex == 0 || minGapIndex == 2 ? oraclePrice : ammPrice;

        let centerPrice =
          toNumber(cometPosition.borrowedUsdi) /
          toNumber(cometPosition.borrowedIasset);

        let liquidityTokenAmount = toNumber(cometPosition.liquidityTokenValue);
        let liquidityTokenSupply = toNumber(pool.liquidityTokenSupply);

        let iassetValue =
          (poolBalances[0] * liquidityTokenAmount) / liquidityTokenSupply;
        let usdiValue =
          (poolBalances[0] * liquidityTokenAmount) / liquidityTokenSupply;
        let ildIsIasset: boolean;
        let ild: number;
        if (borrowedIasset > iassetValue) {
          ildIsIasset = true;
          ild = borrowedIasset - iassetValue;
        } else if (borrowedUsdi > usdiValue) {
          ildIsIasset = false;
          ild = borrowedUsdi - usdiValue;
        } else {
          ildIsIasset = false;
          ild = 0;
        }
        cometInfos.push([
          poolIndex,
          collateralIndex,
          indicatorPrice,
          centerPrice,
          lowerPriceRange,
          upperPriceRange,
          totalCollateralAmount,
          ildIsIasset,
          ild,
          borrowedIasset,
          borrowedUsdi,
          liquidityTokenAmount,
          true,
        ]);
      } catch (e) {
        console.log(e);
      }
    }
    return cometInfos;
  }



export const getUserMintInfos = (tokenData: TokenData, mintPositions: MintPositions) => {
    const mintInfos = [];
    for (let i = 0; i < Number(mintPositions.numPositions); i++) {
      let mintPosition = mintPositions.mintPositions[i];
      let poolIndex = mintPosition.poolIndex;
      let collateralIndex = mintPosition.collateralIndex;
      let pool = tokenData.pools[poolIndex];
      let assetInfo = pool.assetInfo;
      let collateral = tokenData.collaterals[collateralIndex];
      let collateralAmount = toNumber(mintPosition.collateralAmount);
      let price = toNumber(assetInfo.price);
      let borrowedIasset = toNumber(mintPosition.borrowedIasset);
      let collateralRatio: Number;
      let minCollateralRatio: Number;
      if (collateral.stable) {
        collateralRatio = collateralAmount / (price * borrowedIasset);
        minCollateralRatio = toNumber(assetInfo.stableCollateralRatio);
      } else {
        let collateralAssetInfo = tokenData.pools[collateral.poolIndex.toNumber()].assetInfo;
        let collateralPrice = toNumber(collateralAssetInfo.price);
        let collateralAmount = toNumber(mintPosition.collateralAmount);
        collateralRatio =
          (collateralPrice * collateralAmount) / (price * borrowedIasset);
        minCollateralRatio = toNumber(assetInfo.cryptoCollateralRatio);
      }
      mintInfos.push([
        poolIndex,
        collateralIndex,
        price,
        borrowedIasset,
        collateralAmount,
        collateralRatio,
        minCollateralRatio,
      ]);
    }
    return mintInfos;
  }
