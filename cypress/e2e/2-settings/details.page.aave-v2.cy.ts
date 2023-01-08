import assets from '../../fixtures/assets.json';
import constants from '../../fixtures/constants.json';
import { skipState } from '../../support/steps/common';
import {
  configEnvWithTenderlyMainnetFork,
  configEnvWithTenderlyOptimismFork,
} from '../../support/steps/configuration.steps';
import { borrow, supply } from '../../support/steps/main.steps';

const testData = {
  depositETH: {
    asset: assets.aaveMarket.ETH,
    amount: 0.5,
    hasApproval: true,
  },
  testCases: {
    borrow: {
      asset: assets.aaveMarket.USDT,
      amount: 50,
      apyType: constants.borrowAPYType.variable,
      hasApproval: true,
    },
  },
};

describe('VERIFY DETAILS PAGE INTEGRATION SPEC', () => {
  describe(`CASE1:Verifying detail page for v2 USDT)`, () => {
    const skipTestState = skipState(false);
    configEnvWithTenderlyMainnetFork({});

    supply(testData.depositETH, skipTestState, true);
    borrow(testData.testCases.borrow, skipTestState, true);
    describe('Go to details page for the USDT and verify that is not collateral', () => {
      it('Go to detail page for USDT', () => {
        cy.get('[data-cy="menuMarkets"]').click();
        cy.get('[data-cy="marketListItemListItem_USDT"]').click();
      });

      it('Verify that not collateral`', () => {
        cy.contains('Asset cannot be used as collateral.');
      });

      it(`Verify does borrow modals appear`, () => {
        cy.contains('Your info').click();
        cy.get('[data-cy="borrowButton"]').click();
        cy.contains('Borrow USDT');
        cy.contains('Borrow APY rate');
        cy.get('[data-cy="close-button"]').click();
      });

      it('Verify does supply modals appear', () => {
        cy.get('[data-cy="supplyButton"]').click();
        cy.contains('Supply USDT');
        cy.contains('Supply APY');
        cy.get('[data-cy="close-button"]').click();
      });
      describe('CASE2:Verifying detail page for V3 USDT', () => {
        configEnvWithTenderlyOptimismFork({ v3: true });
        describe('Verifying collateral and e-mode  strings on detail page USDT AAVE V3', () => {
          it('Go to detail page for USDT', () => {
            cy.get('[data-cy="menuMarkets"]').click();
            cy.get('[data-cy="marketListItemListItem_USDT"]').click();
          });

          it('Verify that e-mode is visible', () => {
            cy.contains('E-Mode Category');
          });

          it('Verify collateral ', () => {
            cy.contains('Asset can only be used as collateral in isolation mode only.');
          });
        });
      });
    });
  });
});
