import { RequestedTokens, tokenSet } from 'cypress/support/helpers/token.helper';

import assets from '../../../../fixtures/assets.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../../support/steps/configuration.steps';
import { supply, withdraw } from '../../../../support/steps/main.steps';

const tokensToRequest: RequestedTokens = {
  aMATICPolygonV2: 800,
};

const testData = {
  testCases: {
    deposit: {
      asset: assets.polygonMarket.POL,
      amount: 1.09,
      hasApproval: true,
    },
    collateral: {
      switchOff: {
        asset: assets.polygonMarket.POL,
        isCollateralType: true,
        hasApproval: true,
      },
      switchOn: {
        asset: assets.polygonMarket.POL,
        isCollateralType: false,
        hasApproval: true,
      },
      switchNegative: {
        asset: assets.polygonMarket.POL,
        isCollateralType: true,
      },
    },
    withdraw: [
      {
        asset: assets.polygonMarket.POL,
        isCollateral: true,
        amount: 0.01,
        hasApproval: false,
      },
      {
        asset: assets.polygonMarket.POL,
        isCollateral: true,
        amount: 0.01,
        hasApproval: true,
        forWrapped: true,
      },
    ],
  },
};

describe('POL INTEGRATION SPEC, POLYGON V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({ tokens: tokenSet(tokensToRequest) });

  supply(testData.testCases.deposit, skipTestState, true);

  testData.testCases.withdraw.forEach((withdrawCase) => {
    withdraw(withdrawCase, skipTestState, false);
  });
});
