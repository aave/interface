import { skipState } from '../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';
import { claimReward, supply, withdraw } from '../../support/steps/main.steps';
import { rewardIsNotAvailable } from '../../support/steps/verification.steps';
import assets from '../../fixtures/assets.json';

const testData = {
  deposit: {
    asset: assets.aaveMarket.ETH,
    amount: 1000,
    hasApproval: true,
  },
  withdraw: {
    asset: assets.aaveMarket.ETH,
    isCollateral: true,
    amount: 2000,
    hasApproval: false,
  },
  claimReward: {
    asset: assets.aaveMarket.stkAAVE,
  },
};

describe('REWARD, AAVE V2 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({});

  supply(testData.deposit, skipTestState, true);
  claimReward(testData.claimReward, skipTestState, true);
  withdraw(testData.withdraw, skipTestState, true);
  claimReward(testData.claimReward, skipTestState, true);
  rewardIsNotAvailable(skipTestState);
});
