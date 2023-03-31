import { valueToBigNumber } from '@aave/math-utils';
import { SxProps, Theme } from '@mui/system';
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
  sx?: SxProps<Theme>;
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
  const { supplyCapUsage, supplyCapReached } = getSupplyCapData(asset);
  const { borrowCapUsage, borrowCapReached } = getBorrowCapData(asset);
  const { debtCeilingUsage, debtCeilingReached } = getDebtCeilingData(asset);
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
      determineWarningDisplay: ({ supplyCap, icon, ...rest }) =>
        supplyCap ? <SupplyCapWarning supplyCap={supplyCap} icon={icon} {...rest} /> : null,
      displayMaxedTooltip: ({ supplyCap }) =>
        supplyCap ? <SupplyCapMaxedTooltip supplyCap={supplyCap} /> : null,
    },
    borrowCap: {
      percentUsed: borrowCapUsage,
      isMaxed: borrowCapReached,
      // percentUsed: 98.5,
      // isMaxed: false,
      determineWarningDisplay: ({ borrowCap, icon, ...rest }) =>
        borrowCap ? <BorrowCapWarning borrowCap={borrowCap} icon={icon} {...rest} /> : null,
      displayMaxedTooltip: ({ borrowCap }) =>
        borrowCap ? <BorrowCapMaxedTooltip borrowCap={borrowCap} /> : null,
    },
    debtCeiling: {
      percentUsed: debtCeilingUsage,
      isMaxed: debtCeilingReached,
      // percentUsed: 99.994,
      // isMaxed: true,
      determineWarningDisplay: ({ debtCeiling, icon, ...rest }) =>
        debtCeiling ? <DebtCeilingWarning debtCeiling={debtCeiling} icon={icon} {...rest} /> : null,
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

/**
 * Calculates supply cap usage and % of totalLiquidity / supplyCap.
 * @param asset ComputedReserveData
 * @returns { supplyCapUsage: number, supplyCapReached: boolean }
 */
export const getSupplyCapData = (asset: ComputedReserveData) => {
  let supplyCapUsage: number = asset
    ? valueToBigNumber(asset.totalLiquidity).dividedBy(asset.supplyCap).toNumber() * 100
    : 0;
  supplyCapUsage = supplyCapUsage === Infinity ? 0 : supplyCapUsage;
  const supplyCapReached = supplyCapUsage >= 99.99;
  return { supplyCapUsage, supplyCapReached };
};

/**
 * Calculates borrow cap usage and % of totalDebt / borrowCap.
 * @param asset ComputedReserveData
 * @returns { borrowCapUsage: number, borrowCapReached: boolean }
 */
export const getBorrowCapData = (asset: ComputedReserveData) => {
  let borrowCapUsage: number = asset
    ? valueToBigNumber(asset.totalDebt).dividedBy(asset.borrowCap).toNumber() * 100
    : 0;
  borrowCapUsage = borrowCapUsage === Infinity ? 0 : borrowCapUsage;
  const borrowCapReached = borrowCapUsage >= 99.99;
  return { borrowCapUsage, borrowCapReached };
};

/**
 * Calculates debt ceiling usage and % of isolationModeTotalDebt / debtCeiling.
 * @param asset
 * @returns {debtCeilingUsage: number, debtCeilingReached: boolean}
 */
export const getDebtCeilingData = (asset: ComputedReserveData) => {
  let debtCeilingUsage: number = asset
    ? valueToBigNumber(asset.isolationModeTotalDebt).dividedBy(asset.debtCeiling).toNumber() * 100
    : 0;
  debtCeilingUsage = debtCeilingUsage === Infinity ? 0 : debtCeilingUsage;
  const debtCeilingReached = debtCeilingUsage >= 99.99;
  return { debtCeilingUsage, debtCeilingReached };
};
