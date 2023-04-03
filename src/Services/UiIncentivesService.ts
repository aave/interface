import {
  ReservesHelperInput,
  UiIncentiveDataProvider,
  UserReservesHelperInput,
} from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';

export class UiIncentivesDataService {
  private readonly uiIncentivesDataService: UiIncentiveDataProvider;

  constructor(provider: Provider, uiIncentiveDataProviderAddress: string, chainId: number) {
    this.uiIncentivesDataService = new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress,
      provider: provider,
      chainId,
    });
  }
  async getReservesIncentivesDataHumanized({ lendingPoolAddressProvider }: ReservesHelperInput) {
    return this.uiIncentivesDataService.getReservesIncentivesDataHumanized({
      lendingPoolAddressProvider,
    });
  }
  async getUserReservesIncentivesData({
    user,
    lendingPoolAddressProvider,
  }: UserReservesHelperInput) {
    return this.uiIncentivesDataService.getUserReservesIncentivesData({
      user,
      lendingPoolAddressProvider,
    });
  }
}
