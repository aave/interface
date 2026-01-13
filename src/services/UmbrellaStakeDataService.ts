import { StakeDataProviderService } from '@aave/contract-helpers';
import { UmbrellaEthereum } from '@bgd-labs/aave-address-book';
import { Provider } from '@ethersproject/providers';
import { CustomMarket, MarketDataType } from 'src/ui-config/marketsConfig';

type ForkedMarket = `fork_${CustomMarket}`;

type StakeUmbrellaConfig = Partial<
  Record<
    CustomMarket | ForkedMarket,
    {
      stakeDataProvider: string;
      batchHelper: string;
      stakeRewardsController: string;
    }
  >
>;
const umbrellaMainnet = {
  stakeDataProvider: '0x6321ba6b41fbddb6b678cd80db067f20a8770879',
  batchHelper: UmbrellaEthereum.UMBRELLA_BATCH_HELPER,
  stakeRewardsController: UmbrellaEthereum.UMBRELLA_REWARDS_CONTROLLER,
};
export const stakeUmbrellaConfig: StakeUmbrellaConfig = {
  [CustomMarket.proto_mainnet_v3]: umbrellaMainnet,
  [`fork_${CustomMarket.proto_mainnet_v3}`]: umbrellaMainnet,
};

export class UmbrellaStakeDataService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getStakeDataProvider(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    const stakeDataProviderAddress = stakeUmbrellaConfig[marketData.market]?.stakeDataProvider;

    if (!stakeDataProviderAddress || stakeDataProviderAddress === '') {
      throw new Error(
        `Umbrella stake data provider not configured for market: ${marketData.market}`
      );
    }

    return new StakeDataProviderService(stakeDataProviderAddress, provider);
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
