import assets from '../../fixtures/assets.json';
import { skipState } from '../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';
import {
  activateCooldown,
  claimReward,
  stake,
  reCallCooldown,
} from '../../support/steps/stake.steps';

const testCases = [
  {
    asset: assets.staking.AAVE,
    amount: 500,
    checkAmount: '500.00',
    checkAmountFinal: '1,000.00',
    tabValue: 'aave',
  },
  {
    asset: assets.staking.ABPT,
    amount: 500,
    checkAmount: '500.00',
    checkAmountFinal: '1,000.00',
    tabValue: 'bpt',
  },
];

testCases.forEach(
  (testCase: {
    asset: { fullName: string; shortName: string; address: string };
    amount: number;
    checkAmount: string;
    checkAmountFinal: string;
    tabValue: string;
  }) => {
    describe(`STAKE INTEGRATION SPEC, ${testCase.asset.shortName} V2 MARKET`, () => {
      const skipTestState = skipState(false);
      configEnvWithTenderlyMainnetFork({
        tokens: [{ address: testCase.asset.address }],
      });
      stake(
        {
          asset: testCase.asset,
          amount: testCase.amount,
          checkAmount: testCase.checkAmount,
          tabValue: testCase.tabValue,
          hasApproval: false,
        },
        skipTestState,
        true
      );
      claimReward(
        {
          asset: testCase.asset,
        },
        skipTestState,
        false
      );
      activateCooldown(
        {
          asset: testCase.asset,
        },
        skipTestState,
        false
      );
      stake(
        {
          asset: testCase.asset,
          amount: testCase.amount,
          checkAmount: testCase.checkAmountFinal,
          tabValue: testCase.tabValue,
          hasApproval: true,
        },
        skipTestState,
        true
      );
      reCallCooldown(
        {
          asset: testCase.asset,
        },
        skipTestState,
        false
      );
    });
  }
);
