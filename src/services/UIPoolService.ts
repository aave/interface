import {
  LegacyUiPoolDataProvider,
  ReservesDataHumanized,
  UiPoolDataProvider,
  UserReserveDataHumanized,
} from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

export type UserReservesDataHumanized = {
  userReserves: UserReserveDataHumanized[];
  userEmodeCategoryId: number;
};

export class UiPoolService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private async getUiPoolDataService(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    // Temporary check to have the UI detect when the v3.1 upgrade is live so the correct
    // data providers can be used on the fly. Once the upgrade is executed on all markets,
    // this can be removed.
    const poolRevision = await this.getPoolRevision(marketData, provider);
    if (poolRevision < 4 || this.useLegacyUiPoolDataProvider(marketData)) {
      return new LegacyUiPoolDataProvider({
        uiPoolDataProviderAddress: marketData.addresses.UI_POOL_DATA_PROVIDER,
        provider,
        chainId: marketData.chainId,
      });
    } else {
      return new UiPoolDataProvider({
        uiPoolDataProviderAddress: marketData.addresses.V3_1_UI_POOL_DATA_PROVIDER as string,
        provider,
        chainId: marketData.chainId,
      });
    }
  }

  private async getPoolRevision(marketData: MarketDataType, provider: Provider) {
    if (!marketData.v3) {
      return 0;
    }

    const poolContract = new Contract(
      marketData.addresses.LENDING_POOL,
      ['function POOL_REVISION() public view returns (uint256)'],
      provider
    );

    const revision: BigNumber = await poolContract.POOL_REVISION();
    return revision.toNumber();
  }

  private useLegacyUiPoolDataProvider(marketData: MarketDataType) {
    if (
      !marketData.v3 ||
      marketData.marketTitle === 'Fantom' ||
      marketData.marketTitle === 'Harmony'
    ) {
      // it's a v2 market, or it does not have v3.1 upgrade
      return true;
    }

    return false;
  }

  async getReservesHumanized(marketData: MarketDataType): Promise<ReservesDataHumanized> {
    const uiPoolDataProvider = await this.getUiPoolDataService(marketData);
    return uiPoolDataProvider.getReservesHumanized({
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
  }

  async getUserReservesHumanized(
    marketData: MarketDataType,
    user: string
  ): Promise<UserReservesDataHumanized> {
    const uiPoolDataProvider = await this.getUiPoolDataService(marketData);
    return uiPoolDataProvider.getUserReservesHumanized({
      user,
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
  }
}
