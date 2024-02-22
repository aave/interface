import assets from '../../fixtures/assets.json';
import constants from '../../fixtures/constans.json';
import { DashboardActions } from '../../support/actions/dashboard.actions';
import { DashboardHelpers } from '../../support/helpers/dashboard.helper';
import { ModalHelpers } from '../../support/helpers/modal.helper';
import { configEnvWithTenderlyAEthereumV3Fork } from '../../support/steps/configuration.steps';
import gho from './fixtures/gho.json';
import { tokenSet } from './helpers/token.helper';

const testData = {
  borrow: {
    asset: assets.ghoV3Market.GHO,
    amount: 200,
    apyType: constants.borrowAPYType.default,
    hasApproval: true,
  },
};

let minApy: number;
let maxApy: number;

describe.skip(`GHO MODAL APY TESTING`, () => {
  configEnvWithTenderlyAEthereumV3Fork({
    v3: true,
    tokens: tokenSet({ aDAI: 1000 }),
  });
  before(() => {
    cy.doSwitchToDashboardBorrowView();
    cy.get('[data-cy="apy-gho-from"]')
      .invoke('text')
      .then((text) => {
        minApy = parseFloat(text.replace('%', ''));
      });
    cy.get('[data-cy="apy-gho-till"]')
      .invoke('text')
      .then((text) => {
        maxApy = parseFloat(text.replace('%', ''));
      });
  });
  describe(`Verify modal without discount APY = maxApy`, () => {
    configEnvWithTenderlyAEthereumV3Fork({
      v3: true,
      tokens: tokenSet({ aDAI: 1000 }),
    });
    before(`Open Modal`, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(testData.borrow.asset.shortName);
    });
    it(`Verify modal without discount APY=maxApy, no amount`, () => {
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(maxApy);
      });
    });
    it(`Verify modal without discount APY=maxApy, some amount`, () => {
      ModalHelpers.setAmount(100);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(maxApy);
      });
    });
    it(`Verify modal without discount APY=maxApy, max amount`, () => {
      ModalHelpers.setAmount(1000, true);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(maxApy);
      });
    });
  });
  describe(`Verify modal with max discount APY = minApy`, () => {
    configEnvWithTenderlyAEthereumV3Fork({
      v3: true,
      tokens: tokenSet({ stkAave: 50, aDAI: 1000 }),
    });
    before(`Open Modal`, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(testData.borrow.asset.shortName);
    });
    it(`Verify modal with max discount APY=minApy, some amount`, () => {
      ModalHelpers.setAmount(100);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(minApy);
      });
    });
    it(`Verify modal with max discount APY=minApy, max amount`, () => {
      ModalHelpers.setAmount(1000, true);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(minApy);
      });
    });
  });
  describe.skip(`Verify modal in range: min APY minApy - max APY maxApy`, () => {
    configEnvWithTenderlyAEthereumV3Fork({
      v3: true,
      tokens: tokenSet({ stkAave: 1.01, aDAI: 12000 }),
    });
    before(`Open Modal`, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(testData.borrow.asset.shortName);
    });

    it(`Verify modal with max discount APY=minApy, small amount`, () => {
      ModalHelpers.setAmount(100);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(minApy);
      });
    });
    it(`Verify modal with some discount minApy<%APY<maxApy, medium amount`, () => {
      ModalHelpers.setAmount(1000);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.greaterThan(minApy);
        expect($val).to.be.lessThan(maxApy);
      });
    });
  });
  describe(`Verify modal in range: min APY minApy - max APY < maxApy`, () => {
    let maxAPY: number;
    configEnvWithTenderlyAEthereumV3Fork({
      v3: true,
      tokens: tokenSet({ stkAave: 1, aDAI: 500 }),
    });
    before(`Open Modal`, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(testData.borrow.asset.shortName);
      DashboardHelpers.getGhoApyBorrowRangeMax(gho.shortName).then(($val) => {
        maxAPY = $val;
      });
    });
    it(`Verify modal with max discount APY=minApy, small amount`, () => {
      ModalHelpers.setAmount(1);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(minApy);
      });
    });
    it(`Verify modal with some discount minApy < %APY < maxApy, medium amount`, () => {
      ModalHelpers.setAmount(200);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.greaterThan(minApy);
        expect($val).to.be.lessThan(maxAPY);
      });
    });
    it(`Verify modal without discount APY=maxApy, max amount`, () => {
      ModalHelpers.setAmount(1000, true);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(maxAPY);
      });
    });
  });
  // too slow for CI
  describe.skip(`Verify modal with changing discount for APY`, () => {
    let minAPYRage: number;
    let maxAPYRange: number;
    let borrowedAPY: number;
    configEnvWithTenderlyAEthereumV3Fork({
      v3: true,
      tokens: tokenSet({ stkAave: 1, aDAI: 500 }),
    });
    DashboardActions.borrow(testData.borrow);
    it(`Open Modal, and save values`, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(testData.borrow.asset.shortName);
      cy.wait(5000); //TODO: upgrade to waitUntil
      DashboardHelpers.getGhoApyBorrowRangeMax(gho.shortName).then(($val) => {
        maxAPYRange = $val;
      });
      DashboardHelpers.getGhoApyBorrowRangeMin(gho.shortName).then(($val) => {
        minAPYRage = $val;
      });
      DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => {
        borrowedAPY = $val;
      });
    });
    it(`Verify modal with max discount for this case, no amount`, () => {
      cy.wait(2000); //TODO: upgrade to waitUntil
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(borrowedAPY);
        expect($val).to.be.eql(minAPYRage);
      });
    });
    it(`Verify modal with some discount for this case, some amount`, () => {
      ModalHelpers.setAmount(20);
      cy.wait(2000); //TODO: upgrade to waitUntil
      ModalHelpers.getApyOld().then(($val) => {
        expect($val).to.be.eql(borrowedAPY);
        expect($val).to.be.eql(minAPYRage);
      });
      ModalHelpers.getApyNew().then(($val) => {
        expect($val).to.be.greaterThan(borrowedAPY);
        expect($val).to.be.greaterThan(minAPYRage);
        expect($val).to.be.lessThan(maxAPYRange);
      });
    });
    it(`Verify modal with max discount for this case, max amount`, () => {
      ModalHelpers.setAmount(20, true);
      cy.wait(2000); //TODO: upgrade to waitUntil
      ModalHelpers.getApyOld().then(($val) => {
        expect($val).to.be.eql(borrowedAPY);
        expect($val).to.be.eql(minAPYRage);
      });
      ModalHelpers.getApyNew().then(($val) => {
        expect($val).to.be.greaterThan(borrowedAPY);
        expect($val).to.be.greaterThan(minAPYRage);
        expect($val).to.be.eql(maxAPYRange);
      });
    });
  });
});
