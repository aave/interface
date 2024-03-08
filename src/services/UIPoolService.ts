import {
  ReservesDataHumanized,
  UiPoolDataProvider,
  UserReserveDataHumanized,
} from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

export type UserReservesDataHumanized = {
  userReserves: UserReserveDataHumanized[];
  userEmodeCategoryId: number;
};

export class UiPoolService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getUiPoolDataService(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return new UiPoolDataProvider({
      uiPoolDataProviderAddress: marketData.addresses.UI_POOL_DATA_PROVIDER,
      provider,
      chainId: marketData.chainId,
    });
  }

  async getReservesHumanized(marketData: MarketDataType): Promise<ReservesDataHumanized> {
    const uiPoolDataProvider = this.getUiPoolDataService(marketData);
    return uiPoolDataProvider.getReservesHumanized({
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
  }

  async getUserReservesHumanized(
    marketData: MarketDataType,
    user: string
  ): Promise<UserReservesDataHumanized> {
    const uiPoolDataProvider = this.getUiPoolDataService(marketData);
    return uiPoolDataProvider.getUserReservesHumanized({
      user,
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
  }
}
