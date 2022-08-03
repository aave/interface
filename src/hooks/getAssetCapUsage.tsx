import { valueToBigNumber } from '@aave/math-utils';
import { SupplyCapWarning } from 'src/components/transactions/Warnings/SupplyCapWarning';
import { BorrowCapWarning } from 'src/components/transactions/Warnings/BorrowCapWarning';
import { DebtCeilingWarning } from 'src/components/transactions/Warnings/DebtCeilingWarning';
import { ComputedReserveData } from './app-data-provider/useAppDataProvider';

type WarningDisplayProps = {
  supplyCap?: AssetCapData;
  borrowCap?: AssetCapData;
  debtCeiling?: AssetCapData;
  icon?: boolean;
};

export type AssetCapData = {
  percentUsed: number;
  isMaxed: boolean;
};

type AssetCapHookData = AssetCapData & {
  determineWarningDisplay: (props: WarningDisplayProps) => JSX.Element | null;
};

export type AssetCapUsageData = {
  supplyCap: AssetCapHookData;
  borrowCap: AssetCapHookData;
  debtCeiling: AssetCapHookData;
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
  /*
    Supply Cap Data
    % of totalLiquidity / supplyCap
    Set as zero if either is zero
  */
  let supplyCapUsage: number = asset
    ? valueToBigNumber(asset.totalLiquidity).dividedBy(asset.supplyCap).toNumber() * 100
    : 0;
  supplyCapUsage = supplyCapUsage === Infinity ? 0 : supplyCapUsage;
  const supplyCapReached = supplyCapUsage !== Infinity && supplyCapUsage >= 99.99;

  /*
    Borrow Cap Data
    % of totalDebt / borrowCap
    Set as zero if either is zero
  */
  let borrowCapUsage: number = asset
    ? valueToBigNumber(asset.totalDebt).dividedBy(asset.borrowCap).toNumber() * 100
    : 0;
  borrowCapUsage = borrowCapUsage === Infinity ? 0 : borrowCapUsage;
  const borrowCapReached = borrowCapUsage !== Infinity && borrowCapUsage >= 99.99;

  /*
    Debt Ceiling Data
    % of isolationModeTotalDebt / debtCeiling
    Set as zero if either is zero
  */
  let debtCeilingUsage: number = asset
    ? valueToBigNumber(asset.isolationModeTotalDebt).dividedBy(asset.debtCeiling).toNumber() * 100
    : 0;
  debtCeilingUsage = debtCeilingUsage === Infinity ? 0 : debtCeilingUsage;
  const debtCeilingReached = debtCeilingUsage >= 99.99;

  /*
    Aggregated Data
  */
  const assetCapUsageData: AssetCapUsageData = {
    supplyCap: {
      percentUsed: supplyCapUsage,
      isMaxed: supplyCapReached,
      determineWarningDisplay: ({ supplyCap, icon }) =>
        supplyCap ? <SupplyCapWarning supplyCap={supplyCap} icon={icon} /> : null,
      // displayTooltip: (data: AssetCapData, ...rest) => (
      //   <SupplyCapTooltip supplyCap={data} {...rest} />
      // ),
    },
    borrowCap: {
      percentUsed: borrowCapUsage,
      isMaxed: borrowCapReached,
      determineWarningDisplay: ({ borrowCap, icon }) =>
        borrowCap ? <BorrowCapWarning borrowCap={borrowCap} icon={icon} /> : null,
    },
    debtCeiling: {
      percentUsed: debtCeilingUsage,
      isMaxed: debtCeilingReached,
      determineWarningDisplay: ({ debtCeiling, icon }) =>
        debtCeiling ? <DebtCeilingWarning debtCeiling={debtCeiling} icon={icon} /> : null,
    },
  };

  // console.log({ assetCapUsage: assetCapUsageData });

  return assetCapUsageData;
};

export default getAssetCapUsage;
