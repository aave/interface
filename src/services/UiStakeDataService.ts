import { StakingServiceV3, UiStakeDataProviderV3 } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { MarketDataType, marketsData } from 'src/ui-config/marketsConfig';
import { stakeConfig } from 'src/ui-config/stakeConfig';

export class UiStakeDataService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getUiStakeDataService(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return new UiStakeDataProviderV3({
      uiStakeDataProvider: stakeConfig.stakeDataProvider,
      provider,
    });
  }

  private getStakeServiceV3(marketData: MarketDataType, token: string) {
    const provider = this.getProvider(marketData.chainId);

    console.log('token', token, stakeConfig.tokens[token].TOKEN_STAKING);
    return new StakingServiceV3(provider, {
      TOKEN_STAKING_ADDRESS: stakeConfig.tokens[token].TOKEN_STAKING,
    });
  }

  async getGeneralStakeUIDataHumanized(
    marketData: MarketDataType,
    stakedTokens: string[],
    oracles: string[]
  ) {
    const uiStakeDataService = this.getUiStakeDataService(marketData);

    return uiStakeDataService.getStakedAssetDataBatch(stakedTokens, oracles);
  }

  async getUserStakeUIDataHumanized(
    marketData: MarketDataType,
    user: string,
    stakedAssets: string[],
    oracles: string[]
  ) {
    const uiStakeDataService = this.getUiStakeDataService(marketData);

    return uiStakeDataService.getUserStakeUIDataHumanized({ user, stakedAssets, oracles });
  }

  async signStakingApproval({ token, amount, deadline, user }) {
    const service = this.getStakeServiceV3(marketsData, token);

    // const currentUser = get().account;
    return service.signStaking(user, amount, deadline);
  }

  async stakeWithPermit({
    marketData,
    token,
    amount,
    signature,
    deadline,
    user,
  }: {
    marketData: MarketDataType;
    token: string;
    amount: string;
    signature: string;
    deadline: string;
    user: string;
  }) {
    const service = this.getStakeServiceV3(marketData, token);

    return service.stakeWithPermit(user, amount, signature, deadline);
  }

  stake({
    marketData,
    token,
    amount,
    onBehalfOf,
    user,
  }: {
    marketData: MarketDataType;
    token: string;
    amount: string;
    onBehalfOf: string;
    user: string;
  }) {
    const service = this.getStakeServiceV3(marketData, token);

    return service.stake(user, amount, onBehalfOf);
  }

  cooldown(tokenName: string, marketData: MarketDataType) {
    const service = this.getStakeServiceV3(marketData, tokenName);

    // NOTE automatically uses msg.sender
    return service.cooldown();
  }

  claimStakeRewards({
    token,
    amount,
    user,
    marketData,
  }: {
    marketData: MarketDataType;
    token: string;
    amount: string;
    user: string;
  }) {
    const service = this.getStakeServiceV3(marketData, token);

    return service.claimRewards(user, amount);
  }
  redeem(tokenName: string, marketData: MarketDataType, user: string) {
    const service = this.getStakeServiceV3(marketData, tokenName);

    return (amount: string) => service.redeem(user, amount);
  }
}
