import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyBaseFork } from '../../../support/steps/configuration.steps';
import { borrow, emodeActivating } from '../../../support/steps/main.steps';
import {
  borrowsAvailable,
  checkDashboardHealthFactor,
} from '../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aETHBaseV3: 10,
};

const testData = {
  testCases: {
    borrow: {
      asset: assets.gnosisV3Market.wstETH,
      amount: 9999,
      isMaxAmount: true,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
      isRisk: true,
    },
    repay: {
      asset: assets.gnosisV3Market.wstETH,
      apyType: constants.apyType.variable,
      amount: 5,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
  },
};

describe('E-MODE SPEC, GNOSIS V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyBaseFork({
    v3: true,
    tokens: tokenSet(tokensToRequest),
  });
  describe('Prepare min health factor state, with stable coins', () => {
    borrow(testData.testCases.borrow, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
  });
  describe('Turn on E-Mode and verify increase of health factor', () => {
    emodeActivating({ turnOn: true, emodeOption: 'ETH correlated' }, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.07, valueTo: 1000 }, skipTestState);
    borrowsAvailable(skipTestState);
  });
  describe('Turn off E-mode and verify decrease of health factor', () => {
    emodeActivating({ turnOn: false }, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
  });
});
