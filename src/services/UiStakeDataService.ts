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

  async getGeneralStakeUIDataHumanized(marketData: MarketDataType, stakedTokens, oracleAddresses) {
    const uiStakeDataService = this.getUiStakeDataService(marketData);

    // console.log('uiStakeDataService -->', uiStakeDataService);
    console.log('stake DATA params -->', stakedTokens, oracleAddresses);
    // console.log(
    //   'WE GOT DATA -->',
    //   await uiStakeDataService.getGeneralStakeUIData(stakedTokens, oracleAddresses)
    // );
    return uiStakeDataService.getGeneralStakeUIData(stakedTokens, oracleAddresses);
  }

  async getUserStakeUIDataHumanized(marketData: MarketDataType, user: string) {
    const uiStakeDataService = this.getUiStakeDataService(marketData);
    console.log('uiStakeDataService', uiStakeDataService);

    return uiStakeDataService.getUserStakeUIDataHumanized({ user });
  }
}
