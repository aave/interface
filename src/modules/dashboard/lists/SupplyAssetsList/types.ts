import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ReserveIncentiveResponse } from '../../../../hooks/app-data-provider/useIncentiveData';

export type SupplyAssetsItem = {
  underlyingAsset: string;
  symbol: string;
  iconSymbol: string;
  name: string;
  walletBalance: string;
  walletBalanceUSD: string;
  availableToDeposit: string;
  availableToDepositUSD: string;
  supplyAPY: number | string;
  aIncentivesData?: ReserveIncentiveResponse[];
  isFreezed?: boolean;
  isIsolated: boolean;
  totalLiquidity: string;
  supplyCap: string;
  isActive?: boolean;
  usageAsCollateralEnabledOnUser: boolean;
  detailsAddress: string;
  reserve: ComputedReserveData;
};
