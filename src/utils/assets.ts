import { TokenData } from "incept-protocol-sdk/sdk/src/incept";
import { toNumber } from "incept-protocol-sdk/sdk/src/decimal";

export const getiAssetInfos = (tokenData: TokenData) => {
    const iassetInfo = [];
    for (let i = 0; i < Number(tokenData.numPools); i++) {
      let pool = tokenData.pools[i];
      let poolBalances = [toNumber(pool.iassetAmount), toNumber(pool.usdiAmount)];
      let price = poolBalances[1] / poolBalances[0];
      let liquidity = poolBalances[1] * 2;
      iassetInfo.push([i, price, liquidity]);
    }
    return iassetInfo;
  }