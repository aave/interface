import { UiStakeDataProvider } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { stakeConfig } from 'src/ui-config/stakeConfig';

export class UiStakeDataService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getUiStakeDataService(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return new UiStakeDataProvider({
      uiStakeDataProvider: stakeConfig.stakeDataProvider,
      provider,
    });
  }

  async getGeneralStakeUIDataHumanized(marketData: MarketDataType) {
    const uiStakeDataService = this.getUiStakeDataService(marketData);
    return uiStakeDataService.getGeneralStakeUIDataHumanized();
  }

  async getUserStakeUIDataHumanized(marketData: MarketDataType, user: string) {
    const uiStakeDataService = this.getUiStakeDataService(marketData);
    return uiStakeDataService.getUserStakeUIDataHumanized({ user });
  }
}
