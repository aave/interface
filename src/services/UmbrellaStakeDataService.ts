import { ChainId, StakeDataProviderService } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

interface StakeUmbrellaConfig {
  [chain: number]: {
    stakeDataProvider: string;
    stakeGateway: string;
  };
}
export const stakeUmbrellaConfig: StakeUmbrellaConfig = {
  // [ChainId.mainnet]: {}, // TODO: Mainnet addresses
  [ChainId.base_sepolia]: {
    stakeDataProvider: '0x2e2983b7e361Ef17d9b2E0aF5345Ca93F26F33eD',
    stakeGateway: '0x7B0BD7A76C912bE0a48d5B54227e4bF951B4E4BF',
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
