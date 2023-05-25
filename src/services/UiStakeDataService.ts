import { UiStakeDataProvider } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { Hashable } from 'src/utils/types';

type GetUserStakeUIDataHumanizedParams = {
  user: string;
};

export class UiStakeDataService implements Hashable {
  private readonly stakeDataService: UiStakeDataProvider;

  constructor(
    provider: Provider,
    stakeDataProviderAddress: string,
    public readonly chainId: number
  ) {
    this.stakeDataService = new UiStakeDataProvider({
      uiStakeDataProvider: stakeDataProviderAddress,
      provider,
    });
  }

  async getGeneralStakeUIDataHumanized() {
    return this.stakeDataService.getGeneralStakeUIDataHumanized();
  }

  async getUserStakeUIDataHumanized({ user }: GetUserStakeUIDataHumanizedParams) {
    return this.stakeDataService.getUserStakeUIDataHumanized({ user });
  }

  public toHash() {
    return this.chainId.toString();
  }
}
