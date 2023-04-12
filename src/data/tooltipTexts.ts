export const TooltipTexts = {
    priceIndicator: `The price of the iAsset on Incept Markets, this value is calculated using the ratio of USDi to iAsset in the pool.`,
    totalValue: `Represents the total value of all your positions on Incept Liquidity.`,
    collateralRatio: `Designates the ratio in terms of value of the collateral and the borrowed iAsset. For example, if you borrow $100 of iSOL with 200 USDi, then the collateral ratio is 200%. A borrow position is subject to liquidation if the ratio falls below 150%, but we recommend opening a position with a safer ratio of atleast 250%.`,
    collateralBacking: `The amount of collateral backing your borrow position.`,
    collateralDesignated: `Designates the amount of collateral provided to back the comet.`,
    borrowed: `The amount of iAsset borrowed, also referred to as the your debt.`,
    priceRange: `The range within which the designated comet postion will remain active. If the iAsset price leaves this range it is likely that the position will be subject to liquidation.`,
    ildCol: `Stands for Impermanent Loss Debt and represents the amount of debt needed to be payed to offset the impermanent loss and close or recenter the position.`,
    healthScoreCol: `The health score gives you a sense of the level of danger of the comet. A higher score means a lower risk of future liquidation. If the score reaches 0, the position is subject to liquidiation.`,
    recenter: `Recentering allows you to improve your health score by paying off the Impermenant Loss Debt without having to close the comet.`,
    multipoolCometdHealthScore: `The health score gives you a sense of the level of danger of your comet. A higher score means a lower risk of future liquidation. If the score reaches 0, the position is subject to liquidiation.`,
    totalValueMultipoolComet: `The total value in USD of collateral backing your multipool comet.`,
    oraclePrice: `The "true" price of the real world asset represented by the iAsset you wish to borrow. This price is what is used to calculate your collateral ratio.`,
    setCollateralRatio: `Designates the ratio in terms of value of the collateral and the borrowed iAsset. example, if you borrow $100 of iSOL with 200 USDi, then the collateral ratio is 200%. A borrow position is subject to liquidation if the ratio falls below 150%, but we recommend opening a position with a safer ratio of atleast 250%.`,
    cometLiquidityTab: `Navigate here to view and edit all of your single pool comet positions.`,
    unconcentratedLiquidityTab: `Navigate here to view and edit all of your traditional unconcentrated liquidity positions.`,
    borrowPositionTab: `Navigate here to view and edit all of your borrow positions.`,
    multipoolCometTab: `Navigate here to view and edit your multipool comet position.`,
    debtAmount: `The amount of iAsset that you owe.`,
    indebtedAssetWalletBalance: `Amount of iAsset held in your wallet.`,
    collateralWithdraw: `The amount of collateral that you can withdraw after closing the borrow position.`,
    expectedCollateralRatio: `The approximate collateral ratio after (depositing/withdrawing) <- depending on which is selected.`,
    minCollateralRatio: `The minimum collateral ratio necessary before the position is subject to liquidation.`,
    editBorrowPosition: `The Edit Borrow Position interface provides you with the tools to manage your borrow position.`,
    closeBorrowPosition: `The Close Borrow Position interface allows you to close your position by paying off your iAsset debt and reclaim your collateral.`,
    ildDebt: `Stands for Impermanent Loss Debt and represents the amount of debt needed to be payed to offset the impermanent loss and close the position.`,
    collateralWithdrawCloseComet: `The amount of collateral that you can withdraw after closing the comet.`,
    projectedLiquidityConcRange: `The approximate price range of the single pool comet after editing.`,
    projectedMultipoolCollValue: `The approximate collateral value of the multipool comet after editing.`,
    projectedHealthScore: `The approximate health score of the single pool comet after editing.`,
    projectedHealthScoreRecentering: `The appoximate health score of the single pool comet after recentering.`,
    projectedMultipoolHealthScore: `The approximate health score of the multipool comet after editting the liquidity position.`,
    iAssetPrice: `The price of the iAsset on Incept Markets, this value is calculated using the ratio of USDi to iAsset in the pool.`,
    editCometTab: `The Edit Comet interface provides you with the tools to manage their comet position.`,
    closeCometTab: `The Close Comet interface allows you to close their comet and reclaim their collateral.`,
    recenteringCost: `The cost necessary to pay off the impermenant loss debt to recenter.`,
    projectedPriceRange: `The approximate price range of the single pool comet after recentering.`,
    collaterals: `Each collateral in this section makes up the total collateral backing the multi pool comet.`,
    totalCollateralValue: `The total value in USD of collateral backing your multipool comet.`,
    totalLiquidity: `The total amount of liquidity in USD being provided to Incept pools by your multipool comet.`,
    contributedLiquidityPositions: `This is where you can add liquidity to any of Incept's pools using your multipool comet.`,
    projectedMultipoolEditHealthScore: `The approximate health score of the multipool comet after altering the total collateral value.`,
    projectedMultipoolHealthScoreRecentering: `The approximate health score of the multipool comet after recentering.`,
    totalCollateralValueLong: `The total collateral value in USD of the position after depositing/withdrawing <- depending on which action is selected.`,
    projectedMultipoolHealthScoreEstablished: `The approximate health score of the multipool comet after establishing the new liquidity position.`,
    iAssetCol: `The price of the iAsset on Incept Markets, this value is calculated using the ratio of USDi to iAsset in the pool.`,
    liquidityiAssetCol: `Number of iAsset you have provided to the pool using this unconcentrated liquidity position.`,
    liquidityUsdiCol: `Number of USDi you have provided to the pool using this unconcentrated liquidity position.`,
    liquidityValueCol: `Combined value in USD of the total liquidity you have provided to the pool with this unconcentrated liquidity position.`,
    cometLiquidity: `The Comet Liquidity interface allows you to establish a new single pool comet position where one source of collateral will back a concentrated liquidty position for one iAsset pool.`,
    unconcentratedLiquidity: `The Unconcentrated Liquidity interface allows you to provide liquidity to pools in the traditional way,by adding both USDi and iAsset directly from your wallet.`,
    concentrationRange: `The range within which the designated comet postion will remain active. If the iAsset price leaves this range it is likely that the position will be subject to liquidation.`
}