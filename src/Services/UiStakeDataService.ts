import { UiStakeDataProvider } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';

export type StakeGeneralUiData = {
  usdPriceEth: string;
  aave: {
    stakeTokenTotalSupply: string;
    stakeCooldownSeconds: number;
    stakeUnstakeWindow: number;
    stakeTokenPriceEth: string;
    rewardTokenPriceEth: string;
    stakeApy: string;
    distributionPerSecond: string;
    distributionEnd: string;
  };
  bpt: {
    stakeTokenTotalSupply: string;
    stakeCooldownSeconds: number;
    stakeUnstakeWindow: number;
    stakeTokenPriceEth: string;
    rewardTokenPriceEth: string;
    stakeApy: string;
    distributionPerSecond: string;
    distributionEnd: string;
  };
};

export type StakeUserUiData = {
  usdPriceEth: string;
  aave: {
    stakeTokenUserBalance: string;
    underlyingTokenUserBalance: string;
    userCooldown: number;
    userIncentivesToClaim: string;
    userPermitNonce: string;
  };
  bpt: {
    stakeTokenUserBalance: string;
    underlyingTokenUserBalance: string;
    userCooldown: number;
    userIncentivesToClaim: string;
    userPermitNonce: string;
  };
};

type GetUserStakeUIDataHumanizedParams = {
  user: string;
};

export class UiStakeDataService {
  private readonly stakeDataService: UiStakeDataProvider;

  constructor(provider: Provider, stakeDataProviderAddress: string) {
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
}
