import { ChainId, StakeDataProviderService } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

interface StakeUmbrellaConfig {
  [chain: number]: {
    stakeDataProvider: string;
    batchHelper: string;
    stakeRewardsController: string;
  };
}
export const stakeUmbrellaConfig: StakeUmbrellaConfig = {
  // [ChainId.mainnet]: {}, // TODO: Mainnet addresses
  [ChainId.base_sepolia]: {
    stakeDataProvider: '0x3cb7b00b6c09b71998124196691e8bf2694de863',
    batchHelper: '0xcDfb3f2d924b02A78a51F43BC34610dC62ADCEC3',
    stakeRewardsController: '0x412f8957f9A42FFe47B634AB73f89Ff4E0a29026',
  },
};

export class UmbrellaStakeDataService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getStakeDataProvider(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return new StakeDataProviderService(
      stakeUmbrellaConfig[marketData.chainId].stakeDataProvider,
      provider
    );
  }

  async getStakeData(marketData: MarketDataType) {
    const stakeDataProvider = this.getStakeDataProvider(marketData);
    return stakeDataProvider.getStakeDataHumanized();
  }

  async getUserStakeData(marketData: MarketDataType, user: string) {
    const stakeDataProvider = this.getStakeDataProvider(marketData);
    return stakeDataProvider.getUserStakeDataHumanized(user);
  }
}
