import { TokenData } from "incept-protocol-sdk/sdk/src/interfaces";
import { toNumber } from "incept-protocol-sdk/sdk/src/decimal";

export const getiAssetInfos = (tokenData: TokenData): {poolIndex: number, poolPrice: number, liquidity: number}[] => {
    const iassetInfo = [];
    for (let poolIndex = 0; poolIndex < Number(tokenData.numPools); poolIndex++) {
      let pool = tokenData.pools[poolIndex];
      let poolBalances = [toNumber(pool.iassetAmount), toNumber(pool.usdiAmount)];
      let poolPrice = poolBalances[1] / poolBalances[0];
      let liquidity = poolBalances[1] * 2;
      iassetInfo.push({poolIndex, poolPrice, liquidity});
    }
    return iassetInfo;
  }