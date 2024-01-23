import { UiStakeDataProviderV3 } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { stakeConfig } from 'src/ui-config/stakeConfig';

export class UiStakeDataService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getUiStakeDataService(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return new UiStakeDataProviderV3({
      uiStakeDataProvider: stakeConfig.stakeDataProvider,
      provider,
    });
  }

  async getGeneralStakeUIDataHumanized(
    marketData: MarketDataType,
    stakedTokens: string[],
    oracles: string[]
  ) {
    const uiStakeDataService = this.getUiStakeDataService(marketData);

    return uiStakeDataService.getStakedAssetDataBatch(stakedTokens, oracles);
  }

  async getUserStakeUIDataHumanized(
    marketData: MarketDataType,
    user: string,
    stakedAssets: string[],
    oracles: string[]
  ) {
    const uiStakeDataService = this.getUiStakeDataService(marketData);

    return uiStakeDataService.getUserStakeUIDataHumanized({ user, stakedAssets, oracles });
  }
}
