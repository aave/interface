import { UiIncentiveDataProvider } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import invariant from 'tiny-invariant';

export class UiIncentivesDataService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getUiIncentiveDataProvider(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    invariant(
      marketData.addresses.UI_INCENTIVE_DATA_PROVIDER,
      'No UI incentive data provider address found for this market'
    );
    return new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress: marketData.addresses.UI_INCENTIVE_DATA_PROVIDER,
      provider,
      chainId: marketData.chainId,
    });
  }

  async getReservesIncentivesDataHumanized(marketData: MarketDataType) {
    const uiIncentiveDataProvider = this.getUiIncentiveDataProvider(marketData);
    return uiIncentiveDataProvider.getReservesIncentivesDataHumanized({
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
  }
  async getUserReservesIncentivesData(marketData: MarketDataType, user: string) {
    const uiIncentiveDataProvider = this.getUiIncentiveDataProvider(marketData);
    return uiIncentiveDataProvider.getUserReservesIncentivesDataHumanized({
      user,
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
  }
}
