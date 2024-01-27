import { ON_USD } from "~/utils/constants";

export const TooltipTexts = {
    priceIndicator: `The price of the clAsset on Clone Markets, this value is calculated using the ratio of ${ON_USD} to clAsset in the pool.`,
    totalValue: `Represents the total value of all your positions on Clone Liquidity.`,
    collateralRatio: `Designates the ratio in terms of value of the collateral and the borrowed clAsset. For example, if you borrow $100 of onSOL with 200 ${ON_USD}, then the collateral ratio is 200%. A borrow position is subject to liquidation if the ratio falls below 150%, but we recommend opening a position with a safer ratio of atleast 250%.`,
    collateralBacking: `The amount of collateral backing your borrow position.`,
    collateralDesignated: `Designates the amount of collateral provided to back the comet.`,
    borrowed: `The amount of clAsset borrowed, also referred to as the your debt.`,
    priceRange: `The range within which the designated comet position will remain active. If the clAsset price leaves this range it is likely that the position will be subject to liquidation.`,
    ildCol: `Stands for Impermanent Loss Debt and represents the amount of debt needed to be paid to offset the impermanent loss and close the position.`,
    healthScoreCol: `This is your comet's current health score. The health score gives you a sense of the level of danger of the comet.`,
    recenter: `Recentering allows you to improve your health score by paying off the Impermanent Loss Debt without having to close the comet.`,
    cometdHealthScore: `This is your comet's current health score. The health score gives you a sense of the level of danger of the comet.`,
    totalValueComet: `The total value in USD of collateral backing your comet.`,
    oraclePrice: `The "true" price of the real world asset represented by the clAsset you wish to borrow. This price is what is used to calculate your collateral ratio.`,
    setCollateralRatio: `Designates the ratio in terms of value of the collateral and the borrowed clAsset. example, if you borrow $100 of iSOL with 200 ${ON_USD}, then the collateral ratio is 200%. A borrow position is subject to liquidation if the ratio falls below 150%, but we recommend opening a position with a safer ratio of atleast 250%.`,
    cometLiquidityTab: `Navigate here to view and edit all of your single pool comet positions.`,
    unconcentratedLiquidityTab: `Navigate here to view and edit all of your traditional unconcentrated liquidity positions.`,
    borrowPositionTab: `Navigate here to view and edit all of your borrow positions.`,
    cometTab: `Navigate here to view and edit your comet position.`,
    debtAmount: `The amount of clAsset that you owe.`,
    indebtedAssetWalletBalance: `Amount of clAsset held in your wallet.`,
    collateralWithdraw: `The amount of collateral that you can withdraw after closing the borrow position.`,
    expectedCollateralRatio: `The approximate collateral ratio after (depositing/withdrawing) <- depending on which is selected.`,
    minCollateralRatio: `The minimum collateral ratio necessary before the position is subject to liquidation.`,
    editBorrowPosition: `The Edit Borrow Position interface provides you with the tools to manage your borrow position.`,
    closeBorrowPosition: `The Close Borrow Position interface allows you to close your position by paying off your clAsset debt and reclaim your collateral.`,
    ildDebt: `Stands for impermanent loss debt, the total clAsset debt you owe for this liquidity position`,
    collateralWithdrawCloseComet: `The amount of collateral that you can withdraw after closing the comet.`,
    projectedLiquidityConcRange: `The approximate price range of the single pool comet after editing.`,
    projectedCometCollValue: `The approximate collateral value of the comet after editing.`,
    projectedHealthScore: `This is your comet's projected health score after this liquidity position is created. The health score gives you a sense of the level of danger of the comet.`,
    onAssetPrice: `The price of the clAsset on Clone Markets, this value is calculated using the ratio of ${ON_USD} to clAsset in the pool.`,
    editCometTab: `The Edit Comet interface provides you with the tools to manage their comet position.`,
    closeCometTab: `The Close Comet interface allows you to close their comet and reclaim their collateral.`,
    recenteringCost: `The cost necessary to pay off the impermanent loss debt to recenter.`,
    projectedPriceRange: `The approximate price range of the single pool comet after recentering.`,
    collaterals: `Each collateral in this section makes up the total collateral backing the comet.`,
    totalCollateralValue: `The total value in USD of collateral backing your comet.`,
    totalLiquidity: `The total amount of liquidity in USD being provided by your comet.`,
    contributedLiquidityPositions: `This is where you can add liquidity to any of Clone's pools using your comet.`,
    projectedEditHealthScore: `The approximate health score of the comet after altering the total collateral value.`,
    projectedMultipoolHealthScoreRecentering: `The approximate health score of the multipool comet after recentering.`,
    totalCollateralValueLong: `The total collateral value in USD of the position after depositing/withdrawing <- depending on which action is selected.`,
    projectedHealthScoreEstablished: `The approximate health score of the comet after establishing the new liquidity position.`,
    projectedCollateralRatio: 'Projected Collateral Ratio',
    projectedRemainingILD: 'Projected Remaining clAsset ILD',
    onAssetCol: `The price of the clAsset on Clone Markets, this value is calculated using the ratio of ${ON_USD} to clAsset in the pool.`,
    liquidityonAssetCol: `Number of clAsset you have provided to the pool using this unconcentrated liquidity position.`,
    liquidityOnUSDCol: `Number of ${ON_USD} you have provided to the pool using this unconcentrated liquidity position.`,
    liquidityValueCol: `Combined value in USD of the total liquidity you have provided to the pool with this unconcentrated liquidity position.`,
    cometLiquidity: `The Comet Liquidity interface allows you to establish a new single pool comet position where one source of collateral will back a concentrated liquidity position for one clAsset pool.`,
    unconcentratedLiquidity: `The Unconcentrated Liquidity interface allows you to provide liquidity to pools in the traditional way,by adding both ${ON_USD} and clAsset directly from your wallet.`,
    concentrationRange: `The range within which the designated comet position will remain active. If the clAsset price leaves this range it is likely that the position will be subject to liquidation.`,
    rewards: `Claimable clAsset rewards from providing liquidity`,
    usdRewards: `Claimable ${ON_USD} rewards from providing liquidity`,
    yourApy: 'My APY value is the current (24h yield * 365.25) / 24h average collateral',
    collateralInBorrow: 'The total amount of collateral in your borrow positions',
    borrowedAmount: 'The total amount of your borrowed clAsset in USD',
    onAssetToBorrow: 'Choose the clAsset you would like to borrow.',
    collateralAmount: 'The amount of collateral you would like to use to borrow clAssets',
    borrowAmount: 'The amount of clAsset you would like to borrow',
    totalBorrowed: 'The total amount of this clAsset borrowed by all users',
    tvlCollateral: 'The total amount of collateral used to borrow this clAsset by all users',
    liquidityAmount: 'The percentage of the maximum liquidity you are able to provide given the state of your comet',
    newLiquidityValue: 'The total amount of liquidity in USD that you would like this position to provide',
    onUSDILD: `Stands for impermanent loss debt, the total ${ON_USD} debt you owe for this liquidity position`,
    withdrawLiquidity: 'All liquidity must be withdrawn before the position can be closed',
    entireILDBalance: 'All ILD must be paid before the position can be closed',
    claimAllRewards: 'All rewards must be claimed before the position can be closed',
    selectLiquidityPool: 'Choose the liquidity pool you would like to add liquidity to.',
    feeRevenue24h: 'Fee Revenue (24h)',
    avgAPY24h: 'The projected yield for providing liquidity to this pool for a year',
    borrowedCollRatio: 'Designates the ratio of the value of the collateral and the borrowed clAsset. For example, if you borrow $100 of clARB with 400 USDC, then the collateral ratio is 400%. A borrow position is subject to liquidation if the ratio falls below 250%, but we recommend opening a position with a safer ratio of at least 300%.',
    repayFullBorrow: 'All borrowed clAsset must be repaid before the position can be closed',
    withdrawEntire: 'All collateral must be withdrawn before the position can be closed',
    myPositions: {
        liquidityAmount: 'The total amount of liquidity in USD provided for this position',
        ild: "Stands for impermanent loss debt, the total debt you owe for this liquidity position in USD",
        rewards: "The total reward you can claim for this liquidity position in USD",
        apy: "The projected yield for this liquidity position over a year"
    },
    points: {
        totalPoints: 'The sum of all points earned through liquidity provision, trading, and social engagement.',
        lpPoints: 'Points earned by providing liquidity using comets.',
        tradePoints: 'Points earned by trading cloned assets.',
        socialPoints: 'Points earned from participating in Clone’s Zealy campaign.',
    }
}