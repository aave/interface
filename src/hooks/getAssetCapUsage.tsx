import { valueToBigNumber } from '@aave/math-utils';
import { ComputedReserveData } from './app-data-provider/useAppDataProvider';

export type AssetCapData = {
  percentUsed: number;
  isMaxed: boolean;
};

export type AssetCapUsageData = {
  supplyCap: AssetCapData;
  borrowCap: AssetCapData;
  debtCeiling: AssetCapData;
};

type AssetLikeObject =
  | ComputedReserveData
  | (unknown & {
      // Just whitelisting the fields used in this 'hook'
      totalLiquidity: string;
      supplyCap: string;
      totalDebt: string;
      borrowCap: string;
      isolationModeTotalDebt: string;
      debtCeiling: string;
    })
  | undefined;

const getAssetCapUsage = (asset: AssetLikeObject): AssetCapUsageData => {
  // console.log({ asset });

  /*
    Supply Cap Data
  */
  const supplyCapUsage: number = asset
    ? valueToBigNumber(asset.totalLiquidity).dividedBy(asset.supplyCap).toNumber() * 100
    : 0;
  const supplyCapReached = supplyCapUsage !== Infinity && supplyCapUsage >= 99.99;

  /*
    Borrow Cap Data
  */
  const borrowCapUsage: number = asset
    ? valueToBigNumber(asset.totalDebt).dividedBy(asset.borrowCap).toNumber() * 100
    : 0;
  const borrowCapReached = borrowCapUsage !== Infinity && borrowCapUsage >= 99.99;

  /*
    Debt Ceiling Data
  */
  const debtCeilingUsage: number = asset
    ? valueToBigNumber(asset.isolationModeTotalDebt).dividedBy(asset.debtCeiling).toNumber() * 100
    : 0;
  const debtCeilingReached = debtCeilingUsage !== Infinity && debtCeilingUsage >= 99.99;

  /*
    Aggregated Data
  */
  const assetCapUsageData: AssetCapUsageData = {
    supplyCap: {
      percentUsed: supplyCapUsage,
      isMaxed: supplyCapReached,
    },
    borrowCap: {
      percentUsed: borrowCapUsage,
      isMaxed: borrowCapReached,
    },
    debtCeiling: {
      percentUsed: debtCeilingUsage,
      isMaxed: debtCeilingReached,
    },
  };

  // console.log({ assetCapUsage: assetCapUsageData });

  return assetCapUsageData;
};

export default getAssetCapUsage;
