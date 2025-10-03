import { valueToBigNumber } from '@aave/math-utils';
import { SxProps, Theme } from '@mui/system';
import { createContext, ReactNode, useContext } from 'react';
import { BorrowCapMaxedTooltip } from 'src/components/infoTooltips/BorrowCapMaxedTooltip';
import { DebtCeilingMaxedTooltip } from 'src/components/infoTooltips/DebtCeilingMaxedTooltip';
import { SupplyCapMaxedTooltip } from 'src/components/infoTooltips/SupplyCapMaxedTooltip';
import { BorrowCapWarning } from 'src/components/transactions/Warnings/BorrowCapWarning';
import { DebtCeilingWarning } from 'src/components/transactions/Warnings/DebtCeilingWarning';
import { SupplyCapWarning } from 'src/components/transactions/Warnings/SupplyCapWarning';

import { ReserveWithId } from './app-data-provider/useAppDataProvider';

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
  reserve: ReserveWithId;
  supplyCap: AssetCapHookData;
  borrowCap: AssetCapHookData;
  debtCeiling: AssetCapHookData;
};

const getAssetCapData = (asset: ReserveWithId): AssetCapUsageData => {
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
export const AssetCapsSDKContext = createContext({} as AssetCapUsageData);

/*
  Asset Caps Provider Component
*/
export const AssetCapsProvider = ({
  children,
  asset,
}: {
  children: ReactNode;
  asset: ReserveWithId;
}): JSX.Element | null => {
  // Return if no reserve is provided
  if (!asset) {
    console.warn('<AssetCapsProvider /> was not given a valid reserve asset to parse');
    return null;
  }

  const providerValue = getAssetCapData(asset);

  return (
    <AssetCapsSDKContext.Provider value={providerValue}>{children}</AssetCapsSDKContext.Provider>
  );
};

/*
  useAssetCaspsSDKContext hook
*/
export const useAssetCapsSDK = () => {
  const context = useContext(AssetCapsSDKContext);

  if (context === undefined) {
    throw new Error(
      'useAssetCaps() can only be used inside of <AssetCapsProvider />, ' +
        'please declare it at a higher level.'
    );
  }

  return context;
};

export { AssetCapsProvider as AssetCapsProviderSDK };

/**
 * Calculates % of totalLiquidity / supplyCap.
 * @param asset ReserveWithId
 * @returns { supplyCapUsage: number, supplyCapReached: boolean }
 */
export const getSupplyCapData = (asset: ReserveWithId) => {
  const total = valueToBigNumber(asset?.supplyInfo?.total.value ?? '0');
  const cap = valueToBigNumber(asset?.supplyInfo?.supplyCap.amount.value ?? '0');

  const rawUsage = cap.isZero() ? 0 : total.dividedBy(cap).multipliedBy(100).toNumber();

  return {
    supplyCapUsage: Number.isFinite(rawUsage) ? rawUsage : 0,
    supplyCapReached: asset?.supplyInfo?.supplyCapReached ?? false,
  };
};

/**
 * Calculates borrow cap usage and % of totalDebt / borrowCap.
 * @param asset ReserveWithId
 * @returns { borrowCapUsage: number, borrowCapReached: boolean }
 */
export const getBorrowCapData = (asset: ReserveWithId) => {
  const totalDebt = valueToBigNumber(asset?.borrowInfo?.total.amount.value ?? '0');
  const cap = valueToBigNumber(asset?.borrowInfo?.borrowCap.amount.value ?? '0');

  const rawUsage = cap.isZero() ? 0 : totalDebt.dividedBy(cap).multipliedBy(100).toNumber();

  const borrowCapReached = asset?.borrowInfo?.borrowCapReached || rawUsage >= 99.99;

  return {
    borrowCapUsage: Number.isFinite(rawUsage) ? rawUsage : 0,
    borrowCapReached: borrowCapReached ?? false,
  };
};

/**
 * Calculates debt ceiling usage and % of isolationModeTotalDebt / debtCeiling.
 * @param asset
 * @returns {debtCeilingUsage: number, debtCeilingReached: boolean}
 */
export const getDebtCeilingData = (asset: ReserveWithId) => {
  const totalBorrows = valueToBigNumber(
    asset?.isolationModeConfig?.totalBorrows.amount.value ?? '0'
  );
  const debtCeilingCap = valueToBigNumber(
    asset?.isolationModeConfig?.debtCeiling.amount.value ?? '0'
  );
  const rawUsage = debtCeilingCap.isZero()
    ? 0
    : totalBorrows.dividedBy(debtCeilingCap).multipliedBy(100).toNumber();

  return {
    debtCeilingUsage: Number.isFinite(rawUsage) ? rawUsage : 0,
    debtCeilingReached: rawUsage >= 99.99,
  };
};
