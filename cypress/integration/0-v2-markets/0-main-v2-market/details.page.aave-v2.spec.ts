import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';
import { skipState } from '../../../support/steps/common';
import { supply, borrow } from '../../../support/steps/main.steps';
import constants from '../../../fixtures/constans.json';
import assets from '../../../fixtures/assets.json';

const testData = {
  depositETH: {
    asset: assets.aaveMarket.ETH,
    amount: 0.5,
    hasApproval: true,
  },
  testCases: {
    deposit: {
      asset: assets.aaveMarket.USDT,
      amount: 50,
      hasApproval: false,
    },
    borrow: [
      {
        asset: assets.aaveMarket.USDT,
        amount: 50,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
    ],
  },
};
describe('Verify supply and borrow modals does appear', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({});
  supply(testData.depositETH, skipTestState, true);
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });

  describe('Verifing collateral, e-mode and isolation strings on detail page USDT AAVE V2', () => {
    it('Open details page for USDT', () => {
      cy.get('[data-cy="menuMarkets"]').click();
      cy.get('[data-cy="marketListItemListItem_USDT"]').click();
      cy.contains('Asset cannot be used as collateral.');
    });

    it('step2: Switch to V3 market and check e-mode isolation and collateral strings USDT', () => {
      cy.contains('Go Back').click();
      cy.get('[data-cy="marketSelector"]').click();
      cy.contains('Arbitrum').click();
      cy.get('[data-cy="marketListItemListItem_USDT"]').click();
      cy.contains('Asset can only be used as collateral in isolation mode only.');
      cy.contains(
        'E-Mode increases your LTV for a selected category of assets, meaning that when E-mode is enabled, you will have higher borrowing power over assets of the same E-mode category which are defined by Aave Governance.'
      );
    });
  });
});
