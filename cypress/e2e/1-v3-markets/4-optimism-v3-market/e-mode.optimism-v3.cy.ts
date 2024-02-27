import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyOptimismFork } from '../../../support/steps/configuration.steps';
import { borrow, emodeActivating, supply } from '../../../support/steps/main.steps';
import {
  borrowsAvailable,
  checkDashboardHealthFactor,
  checkEmodeActivatingDisabled,
  verifyCountOfBorrowAssets,
} from '../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aETHOptimismV3: 100,
};

const testData = {
  testCases: {
    borrow: {
      asset: assets.optimismMarket.DAI,
      amount: 9999,
      isMaxAmount: true,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
      isRisk: true,
    },
    deposit2: {
      asset: assets.optimismMarket.DAI,
      amount: 100,
      hasApproval: false,
      isMaxAmount: true,
    },
    repay: {
      asset: assets.optimismMarket.DAI,
      apyType: constants.apyType.variable,
      amount: 5,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    eModeAssets: [
      assets.optimismMarket.DAI,
      assets.optimismMarket.USDT,
      assets.optimismMarket.USDC,
      assets.optimismMarket.sUSD,
    ],
  },
};
//due frozen assets
describe.skip('E-MODE SPEC, OPTIMISM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyOptimismFork({
    v3: true,
    tokens: tokenSet(tokensToRequest),
  });
  describe('Prepare min health factor state, with stable coins', () => {
    borrow(testData.testCases.borrow, skipTestState, true);
    supply(testData.testCases.deposit2, skipTestState, true);
    borrow(testData.testCases.borrow, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
  });
  describe('Turn on E-Mode and verify increase of health factor', () => {
    emodeActivating(
      { turnOn: true, multipleEmodes: true, emodeOption: 'Stablecoins' },
      skipTestState,
      true
    );
    checkDashboardHealthFactor({ valueFrom: 1.07, valueTo: 1000 }, skipTestState);
    borrowsAvailable(skipTestState);
    verifyCountOfBorrowAssets({ assets: testData.testCases.eModeAssets }, skipTestState);
  });
  describe('Turn off E-mode and verify decrease of health factor', () => {
    emodeActivating({ turnOn: false }, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
  });
  describe('Turn off E-mode blocked with low health factor', () => {
    emodeActivating(
      { turnOn: true, multipleEmodes: true, emodeOption: 'Stablecoins' },
      skipTestState,
      true
    );
    borrow(testData.testCases.borrow, skipTestState, true);
    checkEmodeActivatingDisabled({ turnOn: false }, skipTestState);
  });
});
