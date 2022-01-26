import { ReserveIncentiveResponse } from '../../../../hooks/app-data-provider/useIncentiveData';

export type SupplyAssetsItem = {
  id: string;
  underlyingAsset: string;
  symbol: string;
  walletBalance: string;
  walletBalanceUSD: string;
  availableToDeposit: string;
  availableToDepositUSD: string;
  underlyingBalance: number | string;
  underlyingBalanceInUSD: number | string;
  liquidityRate: number | string;
  aIncentives: ReserveIncentiveResponse[];
  borrowingEnabled: boolean;
  isFreezed?: boolean;
  isIsolated: boolean;
  totalLiquidity: string;
  supplyCap: string;
  isActive?: boolean;
  usageAsCollateralEnabledOnUser: boolean;
};
