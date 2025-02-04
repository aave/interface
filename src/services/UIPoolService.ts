import {
  EmodeDataHumanized,
  LegacyUiPoolDataProvider,
  ReservesDataHumanized,
  UiPoolDataProvider,
  UserReserveDataHumanized,
} from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';
import { getCustomReservesHumanized } from 'src/utils/reservesHelper';

export type UserReservesDataHumanized = {
  userReserves: UserReserveDataHumanized[];
  userEmodeCategoryId: number;
};

export class UiPoolService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private async getUiPoolDataService(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    if (this.useLegacyUiPoolDataProvider(marketData)) {
      return new LegacyUiPoolDataProvider({
        uiPoolDataProviderAddress: marketData.addresses.UI_POOL_DATA_PROVIDER,
        provider,
        chainId: marketData.chainId,
      });
    } else {
      return new UiPoolDataProvider({
        uiPoolDataProviderAddress: marketData.addresses.UI_POOL_DATA_PROVIDER as string,
        provider,
        chainId: marketData.chainId,
      });
    }
  }

  private useLegacyUiPoolDataProvider(marketData: MarketDataType) {
    if (ENABLE_TESTNET || !marketData.v3) {
      // it's a v2 market, or it does not have v3.1 upgrade
      return true;
    }

    return false;
  }

  async getReservesHumanized(marketData: MarketDataType): Promise<ReservesDataHumanized> {
    const uiPoolDataProvider = await this.getUiPoolDataService(marketData);
    return getCustomReservesHumanized(uiPoolDataProvider, {
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
    // return uiPoolDataProvider.getReservesHumanized({
    //   lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    // });
  }

  async getUserReservesHumanized(
    marketData: MarketDataType,
    user: string
  ): Promise<UserReservesDataHumanized> {
    const uiPoolDataProvider = await this.getUiPoolDataService(marketData);
    return uiPoolDataProvider.getUserReservesHumanized({
      user,
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
  }

  async getEModesHumanized(marketData: MarketDataType): Promise<EmodeDataHumanized[]> {
    const uiPoolDataProvider = await this.getUiPoolDataService(marketData);
    return uiPoolDataProvider.getEModesHumanized({
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
  }
}
