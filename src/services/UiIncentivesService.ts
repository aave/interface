import {
  ReservesHelperInput,
  UiIncentiveDataProvider,
  UserReservesHelperInput,
} from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { Hashable } from 'src/utils/types';

export class UiIncentivesDataService implements Hashable {
  private readonly uiIncentivesDataService: UiIncentiveDataProvider;

  constructor(
    provider: Provider,
    uiIncentiveDataProviderAddress: string,
    public readonly chainId: number
  ) {
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
    return this.uiIncentivesDataService.getUserReservesIncentivesDataHumanized({
      user,
      lendingPoolAddressProvider,
    });
  }
  public toHash() {
    return this.chainId.toString();
  }
}
