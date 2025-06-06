import 'cypress-wait-until';
// import { Provider } from '@ethersproject/providers';

import { CustomizedBridge } from './tools/bridge';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * This will set amount in Modal
       * @param amount number
       * @param max boolean optional
       * @example cy.setAmount('137')
       */
      setAmount(amount: number, max?: boolean): void;
      /**
       * This will make confirmation in Modal
       * @param hasApproval boolean
       * @param actionName string optional, verification button text
       * @param assetName string optional, verification asset name
       * @example cy.doConfirm(true)
       */
      doConfirm(hasApproval: boolean, actionName?: string, assetName?: string): void;
      /**
       * This will return borrowed asset row from Dashboard
       * @param assetName string
       * @param apyType string
       * @example cy.getDashBoardBorrowRow('ETH',constants.borrowAPYType.default)
       */
      getDashBoardBorrowedRow(
        assetName: string,
        apyType: string
      ): Cypress.Chainable<JQuery<HTMLElement>>;
      /**
       * This will return supplied asset row from Dashboard
       * @param assetName string
       * @param isCollateralType boolean optional
       * @example cy.getDashBoardSuppliedRow('ETH')
       */
      getDashBoardSuppliedRow(
        assetName: string,
        isCollateralType?: boolean
      ): Cypress.Chainable<JQuery<HTMLElement>>;
      /**
       * This will switch dashboard view to Borrow
       */
      doSwitchToDashboardBorrowView(): void;
      /**
       * This will switch dashboard view to Supply
       */
      doSwitchToDashboardSupplyView(): void;
      refresh(): void;
      /**
       * This will switch market
       * @param marketName string
       * @param isV3 boolean
       * @example cy.doSwitchMarket('mainnet', true)
       */
      doSwitchMarket(marketName: string, isV3: boolean): void;
    }
  }
}

Cypress.Commands.add('setAmount', (amount: number, max?: boolean) => {
  cy.get('[data-cy=Modal]').find('button:contains("Enter an amount")').should('be.disabled');
  if (max) {
    cy.wait(2000); //there is no way to know when real max amount will upload by UI
    cy.get('[data-cy=Modal]').find('button:contains("Max")').click();
  } else {
    cy.get('[data-cy=Modal] input').first().type(amount.toString());
  }
});

Cypress.Commands.add(
  'doConfirm',
  (hasApproval: boolean, actionName?: string, assetName?: string) => {
    cy.log(`${hasApproval ? 'One step process' : 'Two step process'}`);
    if (!hasApproval) {
      cy.get(`[data-cy=approvalButton]`, { timeout: 20000 })
        .last()
        .should('not.be.disabled')
        .click({ force: true });
    }
    cy.get('[data-cy=actionButton]', { timeout: 30000 })
      .last()
      .should('not.be.disabled')
      .then(($btn) => {
        if (assetName && actionName) {
          expect($btn.first()).to.contain(`${actionName} ${assetName}`);
        }
        if (assetName && !actionName) {
          expect($btn.first()).to.contain(`${actionName}`);
        }
      })
      .click({ force: true });
    cy.get("[data-cy=Modal] h2:contains('All done')").should('be.visible');
  }
);

Cypress.Commands.add('getDashBoardBorrowedRow', (assetName: string) => {
  return cy.get(`[data-cy='dashboardBorrowedListItem_${assetName.toUpperCase()}']`).first();
});

Cypress.Commands.add('getDashBoardSuppliedRow', (assetName: string, isCollateralType?: boolean) => {
  if (isCollateralType) {
    return cy
      .get(`[data-cy='dashboardSuppliedListItem_${assetName.toUpperCase()}_Collateral']`)
      .first();
  } else {
    return cy.get(`[data-cy='dashboardSuppliedListItem_${assetName.toUpperCase()}_NoCollateral']`);
  }
});

const switchDashboardView = (value: string, dashboardTitle: string) => {
  cy.get('[role=group]')
    .contains(value)
    .then(($btn) => {
      if (!$btn.is('disabled')) {
        $btn.click();
      }
    });
  cy.get(`*:contains("Your ${dashboardTitle.toLowerCase()}")`).should('be.visible');
};

Cypress.Commands.add('doSwitchToDashboardBorrowView', () => {
  switchDashboardView('Borrow', 'borrows');
});

Cypress.Commands.add('doSwitchToDashboardSupplyView', () => {
  switchDashboardView('Supply', 'supplies');
});

Cypress.Commands.add('refresh', () => {
  cy.wait(1000); // it's need for some cases where we reload page before full uplaoding page
  cy.visit(window.url, {
    onBeforeLoad(win) {
      // eslint-disable-next-line
      (win as any).ethereum = new CustomizedBridge(window.signer, window.provider);
      win.localStorage.setItem('forkEnabled', 'true');
      win.localStorage.setItem('forkNetworkId', '3030');
      win.localStorage.setItem('forkBaseChainId', window.chainId);
      win.localStorage.setItem('forkRPCUrl', window.rpc);
      win.localStorage.setItem('walletProvider', 'injected');
      win.localStorage.setItem('selectedAccount', window.address);
      win.localStorage.setItem('selectedMarket', window.market);
      win.localStorage.setItem('testnetsEnabled', window.testnetsEnabled);
    },
  });
  cy.wait(1000); //give a time to upload recent data from blockchain
});

Cypress.Commands.add('doSwitchMarket', (marketName: string, isV3: boolean) => {
  cy.get('[data-cy="marketSelector"]').click();
  cy.get(`[data-cy="markets_switch_button_${isV3 ? 'v3' : 'v2'}"]`).then(($btn) => {
    if (!$btn.attr('aria-passed')) {
      $btn.click();
    }
  });
  cy.get(`[data-value="fork_proto_${isV3 ? marketName + '_v3' : marketName}"]`).click();
});

export {};
