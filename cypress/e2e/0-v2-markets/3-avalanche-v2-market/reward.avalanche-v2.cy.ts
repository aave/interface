import assets from '../../../fixtures/assets.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../support/steps/configuration.steps';
import { claimReward, withdraw } from '../../../support/steps/main.steps';
import { rewardIsNotAvailable } from '../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aAVAXAvalancheV2: 1000,
};

const testData = {
  withdraw: {
    asset: assets.avalancheMarket.AVAX,
    isCollateral: true,
    amount: 2000,
    hasApproval: false,
  },
  claimReward: {
    asset: assets.avalancheMarket.WAVAX,
  },
};

describe.skip('REWARD, AVALANCHE V2 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({ tokens: tokenSet(tokensToRequest) });
  claimReward(testData.claimReward, skipTestState, true);
  withdraw(testData.withdraw, skipTestState, true);
  claimReward(testData.claimReward, skipTestState, true);
  rewardIsNotAvailable(skipTestState);
});
