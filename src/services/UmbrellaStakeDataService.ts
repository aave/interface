import { StakeDataProviderService } from '@aave/contract-helpers';
import { UmbrellaEthereum } from '@bgd-labs/aave-address-book';
import { Provider } from '@ethersproject/providers';
import { CustomMarket, MarketDataType } from 'src/ui-config/marketsConfig';

type StakeUmbrellaConfig = Partial<{
  [K in CustomMarket]: {
    stakeDataProvider: string;
    batchHelper: string;
    stakeRewardsController: string;
  };
}>;

export const stakeUmbrellaConfig: StakeUmbrellaConfig = {
  [CustomMarket.proto_mainnet_v3]: {
    stakeDataProvider: '0x437f428930669cd06adab2df4a8d4b203ac729c6',
    batchHelper: UmbrellaEthereum.UMBRELLA_BATCH_HELPER,
    stakeRewardsController: UmbrellaEthereum.UMBRELLA_REWARDS_CONTROLLER,
  },
};

export class UmbrellaStakeDataService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getStakeDataProvider(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return new StakeDataProviderService(
      stakeUmbrellaConfig[marketData.market]?.stakeDataProvider || '',
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
