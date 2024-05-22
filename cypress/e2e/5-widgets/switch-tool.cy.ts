import assets from '../../fixtures/assets.json';
import {
  configEnvWithTenderlyAEthereumV3Fork,
  configEnvWithTenderlyPolygonFork,
} from '../../support/steps/configuration.steps';
import { doCloseModal } from '../../support/steps/main.steps';

const switchByTool = ({
  fromAsset,
  toAsset,
  amount,
  hasApproval = true,
  isMaxAmount = false,
}: {
  fromAsset: { shortName: string; fullName: string };
  toAsset: { shortName: string; fullName: string };
  amount: number;
  hasApproval: boolean;
  isMaxAmount?: boolean;
}) => {
  const _fromAssetName = fromAsset.shortName;
  const _toAssetName = toAsset.shortName;

  describe(`Switch ${_fromAssetName} to ${_toAssetName}`, () => {
    it(`Open switch tool modal`, () => {
      cy.get('button[aria-label="Switch tool"]').click();
    });
    it(`Choose asset from`, () => {
      cy.get('[data-cy=Modal]').as('Modal');
      cy.get('@Modal').find('[data-cy=assetSelect]').eq(0).click();
      cy.get(`[data-cy="assetsSelectOption_${_fromAssetName}"]`, { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      cy.get(`[data-cy="assetsSelectedOption_${_fromAssetName}"]`, {
        timeout: 10000,
      }).should('be.visible', { timeout: 10000 });
    });
    it(`Choose asset to`, () => {
      cy.get('[data-cy=Modal]').as('Modal');
      cy.get('@Modal').find('[data-cy=assetSelect]').eq(1).click();
      cy.get(`[data-cy="assetsSelectOption_${_toAssetName}"]`, { timeout: 10000 })
        .scrollIntoView()
        .click({ force: true });
      cy.get(`[data-cy="assetsSelectedOption_${_toAssetName}"]`, {
        timeout: 10000,
      }).should('be.visible', { timeout: 10000 });
    });
    it(`Set amount`, () => {
      cy.wait(2000); //there is no way to know when real max amount will upload by UI
      if (isMaxAmount) {
        cy.get('[data-cy=Modal]').find('button:contains("Max")').click();
      } else {
        cy.get('[data-cy=Modal] input[aria-label="amount input"]')
          .first()
          .type(amount.toString(), { force: true });
      }
      cy.get('[data-cy=Modal]').as('Modal');
      cy.get('@Modal').find(`#switch-slippage-selector-button`).click();
      cy.get('[value="1.00"]').click();
      cy.wait(2000);
      cy.doConfirm(hasApproval, 'Switch');
    });

    doCloseModal();
  });
};

const testData = {
  ethereum: [
    {
      fromAsset: assets.ethereumV3Market.ETH,
      toAsset: assets.ethereumV3Market.DAI,
      amount: 1,
      hasApproval: true,
      isMaxAmount: false,
    },
  ],
  polygon: [
    {
      fromAsset: assets.polygonV3Market.MATIC,
      toAsset: assets.polygonV3Market.USDC,
      amount: 1,
      hasApproval: true,
      isMaxAmount: false,
    },
  ],
};

describe('SWITCH BY SWITCH TOOL, ETHEREUM', () => {
  // const skipTestState = skipState(false);
  configEnvWithTenderlyAEthereumV3Fork({ v3: true });

  testData.ethereum.forEach((swapCase) => {
    switchByTool(swapCase);
  });
});

describe('SWITCH BY SWITCH TOOL, POLYGON', () => {
  // const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({ v3: true });

  testData.polygon.forEach((swapCase) => {
    switchByTool(swapCase);
  });
});
