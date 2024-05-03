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

export type UiPoolMarketDataType = Pick<MarketDataType, 'chainId'> & {
  addresses: Pick<
    MarketDataType['addresses'],
    'LENDING_POOL_ADDRESS_PROVIDER' | 'UI_POOL_DATA_PROVIDER'
  >;
};

export class UiPoolService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getUiPoolDataService(marketData: UiPoolMarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return new UiPoolDataProvider({
      uiPoolDataProviderAddress: marketData.addresses.UI_POOL_DATA_PROVIDER,
      provider,
      chainId: marketData.chainId,
    });
  }

  async getReservesHumanized(marketData: UiPoolMarketDataType): Promise<ReservesDataHumanized> {
    const uiPoolDataProvider = this.getUiPoolDataService(marketData);
    return uiPoolDataProvider.getReservesHumanized({
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
  }

  async getUserReservesHumanized(
    marketData: UiPoolMarketDataType,
    user: string
  ): Promise<UserReservesDataHumanized> {
    const uiPoolDataProvider = this.getUiPoolDataService(marketData);
    return uiPoolDataProvider.getUserReservesHumanized({
      user,
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
  }
}
