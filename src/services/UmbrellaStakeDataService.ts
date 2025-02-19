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
    stakeDataProvider: '0x8aC1CC9ba5a8d2ACa779cc9dB78AD9F493731886',
    stakeGateway: '0xe2754b298eac661b02100ea1c302fe3117bbf962',
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
