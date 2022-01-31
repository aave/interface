import { ReserveIncentiveResponse } from '../../../../hooks/app-data-provider/useIncentiveData';

export type SupplyAssetsItem = {
  underlyingAsset: string;
  symbol: string;
  iconSymbol: string;
  walletBalance: string;
  walletBalanceUSD: string;
  availableToDeposit: string;
  availableToDepositUSD: string;
  liquidityRate: number | string;
  aIncentives: ReserveIncentiveResponse[];
  isFreezed?: boolean;
  isIsolated: boolean;
  totalLiquidity: string;
  supplyCap: string;
  isActive?: boolean;
  usageAsCollateralEnabledOnUser: boolean;
};
