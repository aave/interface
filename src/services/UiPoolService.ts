import {
  ReservesHelperInput,
  UiPoolDataProvider,
  UserReservesHelperInput,
} from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { Hashable } from 'src/utils/types';

export class UiPoolService implements Hashable {
  private readonly uiPoolDataProviderService: UiPoolDataProvider;

  constructor(
    provider: Provider,
    uiPoolDataProviderAddress: string,
    public readonly chainId: number
  ) {
    this.uiPoolDataProviderService = new UiPoolDataProvider({
      uiPoolDataProviderAddress,
      provider: provider,
      chainId,
    });
  }
  async getReservesHumanized({ lendingPoolAddressProvider }: ReservesHelperInput) {
    return this.uiPoolDataProviderService.getReservesHumanized({
      lendingPoolAddressProvider,
    });
  }
  async getUserReservesHumanized({ user, lendingPoolAddressProvider }: UserReservesHelperInput) {
    return this.uiPoolDataProviderService.getUserReservesHumanized({
      user,
      lendingPoolAddressProvider,
    });
  }

  public toHash() {
    return this.chainId.toString();
  }
}
