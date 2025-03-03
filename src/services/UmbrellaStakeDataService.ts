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
    batchHelper: '0xAaA87d031d991B6faAb8076AAea518072Fc8E6F2',
    stakeRewardsController: '0x8dd1E13fe050C6319eD74d540ACF2a9603C08Fe8',
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
