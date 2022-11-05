import { valueToBigNumber } from '@aave/math-utils';
import { createContext, ReactNode, useContext } from 'react';
import { BorrowCapMaxedTooltip } from 'src/components/infoTooltips/BorrowCapMaxedTooltip';
import { DebtCeilingMaxedTooltip } from 'src/components/infoTooltips/DebtCeilingMaxedTooltip';
import { SupplyCapMaxedTooltip } from 'src/components/infoTooltips/SupplyCapMaxedTooltip';
import { BorrowCapWarning } from 'src/components/transactions/Warnings/BorrowCapWarning';
import { DebtCeilingWarning } from 'src/components/transactions/Warnings/DebtCeilingWarning';
import { SupplyCapWarning } from 'src/components/transactions/Warnings/SupplyCapWarning';

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

export type AssetCapHookData = AssetCapData & {
  determineWarningDisplay: (props: WarningDisplayProps) => JSX.Element | null;
  displayMaxedTooltip: (props: WarningDisplayProps) => JSX.Element | null;
};

export type AssetCapUsageData = {
  reserve: ComputedReserveData;
  supplyCap: AssetCapHookData;
  borrowCap: AssetCapHookData;
  debtCeiling: AssetCapHookData;
};

const getAssetCapData = (asset: ComputedReserveData): AssetCapUsageData => {
  /*
  Supply Cap Data
    % of totalLiquidity / supplyCap
    Set as zero if either is zero
  */
  let supplyCapUsage: number = asset
    ? valueToBigNumber(asset.totalLiquidity).dividedBy(asset.supplyCap).toNumber() * 100
    : 0;
  supplyCapUsage = supplyCapUsage === Infinity ? 0 : supplyCapUsage;
  const supplyCapReached = supplyCapUsage >= 99.99;

  /*
  Borrow Cap Data
    % of totalDebt / borrowCap
    Set as zero if either is zero
  */
  let borrowCapUsage: number = asset
    ? valueToBigNumber(asset.totalDebt).dividedBy(asset.borrowCap).toNumber() * 100
    : 0;
  borrowCapUsage = borrowCapUsage === Infinity ? 0 : borrowCapUsage;
  const borrowCapReached = borrowCapUsage >= 99.99;

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
    reserve: asset,
    supplyCap: {
      percentUsed: supplyCapUsage,
      isMaxed: supplyCapReached,
      // percentUsed: 99.9,
      // isMaxed: true,
      determineWarningDisplay: ({ supplyCap, icon }) =>
        supplyCap ? <SupplyCapWarning supplyCap={supplyCap} icon={icon} /> : null,
      displayMaxedTooltip: ({ supplyCap }) =>
        supplyCap ? <SupplyCapMaxedTooltip supplyCap={supplyCap} /> : null,
    },
    borrowCap: {
      percentUsed: borrowCapUsage,
      isMaxed: borrowCapReached,
      // percentUsed: 98.5,
      // isMaxed: false,
      determineWarningDisplay: ({ borrowCap, icon }) =>
        borrowCap ? <BorrowCapWarning borrowCap={borrowCap} icon={icon} /> : null,
      displayMaxedTooltip: ({ borrowCap }) =>
        borrowCap ? <BorrowCapMaxedTooltip borrowCap={borrowCap} /> : null,
    },
    debtCeiling: {
      percentUsed: debtCeilingUsage,
      isMaxed: debtCeilingReached,
      // percentUsed: 99.994,
      // isMaxed: true,
      determineWarningDisplay: ({ debtCeiling, icon }) =>
        debtCeiling ? <DebtCeilingWarning debtCeiling={debtCeiling} icon={icon} /> : null,
      displayMaxedTooltip: ({ debtCeiling }) =>
        debtCeiling ? <DebtCeilingMaxedTooltip debtCeiling={debtCeiling} /> : null,
    },
  };

  return assetCapUsageData;
};

/*
  Asset Caps Context
*/
const AssetCapsContext = createContext({} as AssetCapUsageData);

/*
  Asset Caps Provider Component
*/
export const AssetCapsProvider = ({
  children,
  asset,
}: {
  children: ReactNode;
  asset: ComputedReserveData;
}): JSX.Element | null => {
  // Return if no reserve is provided
  if (!asset) {
    console.warn('<AssetCapsProvider /> was not given a valid reserve asset to parse');
    return null;
  }

  const providerValue = getAssetCapData(asset);

  return <AssetCapsContext.Provider value={providerValue}>{children}</AssetCapsContext.Provider>;
};

/*
  useAssetCaspsContext hook
*/
export const useAssetCaps = () => {
  const context = useContext(AssetCapsContext);

  if (context === undefined) {
    throw new Error(
      'useAssetCaps() can only be used inside of <AssetCapsProvider />, ' +
        'please declare it at a higher level.'
    );
  }

  return context;
};
