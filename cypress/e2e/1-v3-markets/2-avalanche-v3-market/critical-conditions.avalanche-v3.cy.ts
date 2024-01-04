import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../support/steps/configuration.steps';
import { borrow, supply, withdraw } from '../../../support/steps/main.steps';
import { checkDashboardHealthFactor } from '../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aAVAXAvalancheV3: 1,
};

const testData = {
  testCases: {
    borrow: {
      asset: assets.avalancheV3Market.DAI,
      amount: 1,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
      isRisk: true,
      isMaxAmount: true,
    },
    deposit2: {
      asset: assets.avalancheV3Market.AVAX,
      amount: 1,
      hasApproval: true,
    },
    withdraw: {
      asset: assets.avalancheV3Market.AVAX,
      isCollateral: true,
      amount: 9999,
      hasApproval: false,
      isMaxAmount: true,
      isRisk: true,
    },
  },
};

describe('CRITICAL CONDITIONS SPEC, AVALANCHE V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({
    market: 'fork_proto_avalanche_v3',
    v3: true,
    tokens: tokenSet(tokensToRequest),
  });
  borrow(testData.testCases.borrow, skipTestState, true);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.11 }, skipTestState);
  supply(testData.testCases.deposit2, skipTestState, true);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.11 }, skipTestState);
});
