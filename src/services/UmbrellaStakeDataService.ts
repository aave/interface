import { ChainId, StakeDataProviderService } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

interface StakeUmbrellaConfig {
  [chain: number]: {
    stakeDataProvider: string;
    stakeGateway: string;
    stakeRewardsController: string;
  };
}
export const stakeUmbrellaConfig: StakeUmbrellaConfig = {
  // [ChainId.mainnet]: {}, // TODO: Mainnet addresses
  [ChainId.base_sepolia]: {
    stakeDataProvider: '0xAaA87d031d991B6faAb8076AAea518072Fc8E6F2',
    stakeGateway: '0xa00674dE7337F753FC188b49BeAbD1F437e8EA7f',
    stakeRewardsController: '0xD1eC142cc2fA5ABf78Be9868F564aC0AAdD6aAB6',
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
