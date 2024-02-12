import assets from '../../fixtures/assets.json';
import { skipState } from '../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';
import {
  activateCooldown,
  claimReward,
  reCallCooldown,
  reStake,
  stake,
} from '../../support/steps/stake.steps';

const testCases = [
  {
    asset: assets.staking.GHO,
    amount: 5,
    checkAmount: '5.00',
    checkAmountFinal: '10.00',
    tabValue: 'gho',
    changeApproval: false,
  },
  {
    asset: assets.staking.AAVE,
    amount: 5,
    checkAmount: '5.00',
    checkAmountFinal: '10.00',
    tabValue: 'aave',
    changeApproval: true,
  },
  // {
  //   asset: assets.staking.ABPT,
  //   amount: 5,
  //   checkAmount: '5.00',
  //   checkAmountFinal: '10.00',
  //   tabValue: 'bpt',
  //   changeApproval: false,
  // },
];

testCases.forEach(
  (testCase: {
    asset: { fullName: string; shortName: string; address: string };
    amount: number;
    checkAmount: string;
    checkAmountFinal: string;
    tabValue: string;
    changeApproval: boolean;
  }) => {
    describe(`STAKE INTEGRATION SPEC, ${testCase.asset.shortName}`, () => {
      const skipTestState = skipState(false);
      configEnvWithTenderlyMainnetFork({
        tokens: [{ tokenAddress: testCase.asset.address }],
      });
      stake(
        {
          asset: testCase.asset,
          amount: testCase.amount,
          checkAmount: testCase.checkAmount,
          tabValue: testCase.tabValue,
          hasApproval: false,
          changeApproval: testCase.changeApproval,
        },
        skipTestState,
        true
      );
      activateCooldown(
        {
          asset: testCase.asset,
        },
        skipTestState,
        false
      );
      if (testCase.asset === assets.staking.AAVE) {
        claimReward(
          {
            asset: testCase.asset,
          },
          skipTestState,
          false
        );
        reStake(
          {
            asset: testCase.asset,
          },
          skipTestState,
          false
        );
      }
      stake(
        {
          asset: testCase.asset,
          amount: testCase.amount,
          checkAmount: testCase.checkAmountFinal,
          tabValue: testCase.tabValue,
          hasApproval: testCase.asset.shortName === 'GHO' ? false : true,
          changeApproval: testCase.changeApproval,
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
